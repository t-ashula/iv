// railgun vm stack
// construct Frame on this stack,
// and traverse Frames when GC maker comes
#ifndef _IV_LV5_RAILGUN_STACK_H_
#define _IV_LV5_RAILGUN_STACK_H_
#include <cstddef>
#include <cmath>
#include <algorithm>
#include <iterator>
#include <new>
#include <gc/gc.h>
extern "C" {
#include <gc/gc_mark.h>
}
#include "noncopyable.h"
#include "singleton.h"
#include "os_allocator.h"
#include "lv5/internal.h"
#include "lv5/jsval.h"
#include "lv5/railgun/frame.h"
namespace iv {
namespace lv5 {
namespace railgun {

class Stack : core::Noncopyable<Stack> {
 public:
  typedef JSVal* iterator;
  typedef const JSVal* const_iterator;
  typedef struct GC_ms_entry GCMSEntry;

  typedef std::iterator_traits<iterator>::value_type value_type;

  typedef std::iterator_traits<iterator>::pointer pointer;
  typedef std::iterator_traits<const_iterator>::pointer const_pointer;
  typedef std::iterator_traits<iterator>::reference reference;
  typedef std::iterator_traits<const_iterator>::reference const_reference;

  typedef std::reverse_iterator<iterator> reverse_iterator;
  typedef std::reverse_iterator<const_iterator> const_reverse_iterator;

  typedef std::iterator_traits<iterator>::difference_type difference_type;
  typedef std::size_t size_type;

  // not bytes. JSVals capacity.
  // if you calc bytes, sizeof(JSVal) * kStackCapacity
  static const size_type kStackCapacity = 16 * 1024;
  static const size_type kStackBytes = kStackCapacity * sizeof(JSVal);

  // bytes. 4KB is page size.
  static const size_type kCommitSize = 4 * 1024;

  class Resource {
   public:
    explicit Resource(Stack* stack)
      : stack_(stack) { }
    Stack* stack() const {
      return stack_;
    }
   private:
    Stack* stack_;
  };

  class GCKind : public core::Singleton<GCKind> {
   public:
    friend class core::Singleton<GCKind>;

    int GetKind() const {
      return stack_kind_;
    }

   private:
    GCKind()
      : stack_kind_(GC_new_kind(GC_new_free_list(),
                                GC_MAKE_PROC(GC_new_proc(&Mark), 0), 0, 1)) {
    }

    ~GCKind() { }  // private destructor

    volatile int stack_kind_;
  };

  Stack()
    : stack_(NULL),
      stack_pointer_(NULL),
      resource_(NULL),
      base_(NULL),
      current_(NULL) {
    stack_pointer_ = stack_ =
        reinterpret_cast<JSVal*>(
            core::OSAllocator::Allocate(kStackBytes));
    stack_pointer_ += 1;  // for Global This
    // register root
    resource_ =
        new (GC_generic_malloc(sizeof(Resource),
                               GCKind::Instance()->GetKind())) Resource(this);
  }

  ~Stack() {
    core::OSAllocator::Decommit(stack_, kStackBytes);
    core::OSAllocator::Deallocate(stack_, kStackBytes);
    GC_free(resource_);
  }

  // returns new frame for function call
  Frame* NewCodeFrame(Context* ctx,
                      JSVal* sp,
                      Code* code,
                      JSEnv* env,
                      const uint8_t* pc,
                      std::size_t argc,
                      bool constructor_call) {
    assert(code);
    if (JSVal* mem = GainFrame(sp, code)) {
      Frame* frame = reinterpret_cast<Frame*>(mem);
      frame->code_ = code;
      frame->prev_pc_ = pc;
      frame->variable_env_ = frame->lexical_env_ =
          internal::NewDeclarativeEnvironment(ctx, env);
      frame->prev_ = current_;
      frame->ret_ = JSUndefined;
      frame->argc_ = argc;
      frame->dynamic_env_level_ = 0;
      frame->constructor_call_ = constructor_call;
      current_ = frame;
      return frame;
    } else {
      // stack overflow
      return NULL;
    }
  }

  Frame* NewEvalFrame(Context* ctx,
                      JSVal* sp,
                      Code* code,
                      JSEnv* variable_env,
                      JSEnv* lexical_env) {
    assert(code);
    if (JSVal* mem = GainFrame(sp, code)) {
      Frame* frame = reinterpret_cast<Frame*>(mem);
      frame->code_ = code;
      frame->prev_pc_ = NULL;
      frame->variable_env_ = variable_env;
      frame->lexical_env_ = lexical_env;
      frame->prev_ = current_;
      frame->ret_ = JSUndefined;
      frame->argc_ = 0;
      frame->dynamic_env_level_ = 0;
      frame->constructor_call_ = false;
      current_ = frame;
      return frame;
    } else {
      // stack overflow
      return NULL;
    }
  }

  Frame* NewGlobalFrame(Context* ctx, Code* code) {
    assert(code);
    if (JSVal* mem = GainFrame(stack_ + 1, code)) {
      Frame* frame = reinterpret_cast<Frame*>(mem);
      frame->code_ = code;
      frame->prev_pc_ = NULL;
      frame->variable_env_ = frame->lexical_env_ = ctx->global_env();
      frame->prev_ = NULL;
      frame->ret_ = JSUndefined;
      frame->argc_ = 0;
      frame->dynamic_env_level_ = 0;
      frame->constructor_call_ = false;
      current_ = frame;
      return frame;
    } else {
      // stack overflow
      return NULL;
    }
  }

  void SetThis(JSVal val) {
    *stack_ = val;
  }

  Frame* Unwind(Frame* frame) {
    assert(current_ == frame);
    assert(frame->code());
    SetSafeStackPointerForFrame(frame, frame->prev_);
    current_ = frame->prev_;
    return current_;
  }

  static GCMSEntry* Mark(GC_word* top,
                         GCMSEntry* entry,
                         GCMSEntry* mark_sp_limit,
                         GC_word env) {
    // GC bug...
    Stack* stack = reinterpret_cast<Resource*>(top)->stack();
    if (stack) {
      Frame* current = stack->current_;
      if (current) {
        // mark Frame member
        entry = MarkFrame(entry, mark_sp_limit, current, stack->stack_pointer_);
        // traverse frames
        for (Frame *next = current, *now = current->prev_;
             now; next = now, now = next->prev_) {
          entry = MarkFrame(entry, mark_sp_limit, now, next->GetFrameBase());
        }
      }
    }
    return entry;
  }

  const_iterator begin() const {
    return stack_;
  }

  const_iterator end() const {
    return stack_ + kStackCapacity;
  }

  iterator begin() {
    return stack_;
  }

  iterator end() {
    return stack_ + kStackCapacity;
  }

  pointer GetTop() {
    return stack_pointer_;
  }

  // these 2 function Gain / Release is reserved for ScopedArguments
  pointer Gain(size_type n) {
    if (stack_pointer_ + n < end()) {
      const pointer stack = stack_pointer_;
      stack_pointer_ += n;
      return stack;
    } else {
      // stack over flow
      return NULL;
    }
  }

  void Release(size_type n) {
    stack_pointer_ -= n;
  }

  Frame* current() {
    return current_;
  }

 private:
  static GCMSEntry* MarkFrame(GCMSEntry* entry,
                              GCMSEntry* mark_sp_limit,
                              Frame* frame, JSVal* last) {
    entry = GC_MARK_AND_PUSH(frame->code_,
                             entry, mark_sp_limit,
                             reinterpret_cast<void**>(&frame));
    entry = GC_MARK_AND_PUSH(frame->lexical_env_,
                             entry, mark_sp_limit,
                             reinterpret_cast<void**>(&frame));
    entry = GC_MARK_AND_PUSH(frame->variable_env_,
                             entry, mark_sp_limit,
                             reinterpret_cast<void**>(&frame));
    if (frame->ret_.IsPtr()) {
      void* ptr = frame->ret_.pointer();
      entry = GC_MARK_AND_PUSH(ptr,
                               entry, mark_sp_limit,
                               reinterpret_cast<void**>(&frame));
    }

    // start current frame marking
    for (JSVal *it = frame->GetStackBase(); it != last; ++it) {
      if (it->IsPtr()) {
        void* ptr = it->pointer();
        entry = GC_MARK_AND_PUSH(ptr,
                                 entry, mark_sp_limit,
                                 reinterpret_cast<void**>(&frame));
      }
    }
    return entry;
  }

  void SetSafeStackPointerForFrame(Frame* prev, Frame* current) {
    if (current) {
      JSVal* frame_last = current->GetFrameEnd();
      JSVal* prev_first = prev->GetFrameBase();
      stack_pointer_ = std::max(frame_last, prev_first);
    } else {
      // previous of Global Frame is NULL
      stack_pointer_ = stack_ + 1;
    }
  }

  JSVal* GainFrame(JSVal* top, Code* code) {
    assert(stack_ < top);
    assert(top <= stack_pointer_);
    stack_pointer_ = top;
    return Gain(Frame::GetFrameSize(code->stack_depth()));
  }

  // stack_pointer_ is safe point

  JSVal* stack_;
  JSVal* stack_pointer_;
  Resource* resource_;
  Frame* base_;
  Frame* current_;
};

} } }  // namespace iv::lv5::railgun
#endif  // _IV_LV5_RAILGUN_STACK_H_
