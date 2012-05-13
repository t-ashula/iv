// Stub functions implementations
#ifndef IV_LV5_BREAKER_STUB_H_
#define IV_LV5_BREAKER_STUB_H_
#include <iv/lv5/breaker/fwd.h>
#include <iv/lv5/railgun/railgun.h>
#include <iv/lv5/breaker/templates.h>
namespace iv {
namespace lv5 {
namespace breaker {

inline Rep Extract(JSVal val) {
  return val.Layout().bytes_;
}

namespace stub {

#define ERR\
  ctx->PendingError());\
  if (*ctx->PendingError()) {\
    IV_LV5_BREAKER_RAISE();\
  }\
((void)0
#define DUMMY )  // to make indentation work
#undef DUMMY


inline void BUILD_ENV(railgun::Context* ctx, railgun::Frame* frame,
                      uint32_t size, uint32_t mutable_start) {
  frame->variable_env_ = frame->lexical_env_ =
      JSDeclEnv::New(ctx,
                     frame->lexical_env(),
                     size,
                     frame->code()->names().begin(),
                     mutable_start);
}

inline Rep WITH_SETUP(railgun::Context* ctx, railgun::Frame* frame, JSVal src) {
  JSObject* const obj = src.ToObject(ctx, ERR);
  JSObjectEnv* const with_env =
      JSObjectEnv::New(ctx, frame->lexical_env(), obj);
  with_env->set_provide_this(true);
  frame->set_lexical_env(with_env);
  return 0;
}

inline Rep BINARY_ADD(railgun::Context* ctx, JSVal lhs, JSVal rhs) {
  assert(!lhs.IsNumber() || !rhs.IsNumber());
  if (lhs.IsString()) {
    if (rhs.IsString()) {
      return Extract(JSString::New(ctx, lhs.string(), rhs.string()));
    } else {
      const JSVal rp = rhs.ToPrimitive(ctx, Hint::NONE, ERR);
      JSString* const rs = rp.ToString(ctx, ERR);
      return Extract(JSString::New(ctx, lhs.string(), rs));
    }
  }

  const JSVal lprim = lhs.ToPrimitive(ctx, Hint::NONE, ERR);
  const JSVal rprim = rhs.ToPrimitive(ctx, Hint::NONE, ERR);
  if (lprim.IsString() || rprim.IsString()) {
    JSString* const lstr = lprim.ToString(ctx, ERR);
    JSString* const rstr = rprim.ToString(ctx, ERR);
    return Extract(JSString::New(ctx, lstr, rstr));
  }

  const double left = lprim.ToNumber(ctx, ERR);
  const double right = rprim.ToNumber(ctx, ERR);
  return Extract(left + right);
}

inline Rep BINARY_SUBTRACT(railgun::Context* ctx, JSVal lhs, JSVal rhs) {
  const double left = lhs.ToNumber(ctx, ERR);
  const double res = left -  rhs.ToNumber(ctx, ERR);
  return Extract(res);
}

inline Rep BINARY_MULTIPLY(railgun::Context* ctx, JSVal lhs, JSVal rhs) {
  const double left = lhs.ToNumber(ctx, ERR);
  const double res = left *  rhs.ToNumber(ctx, ERR);
  return Extract(res);
}

inline Rep BINARY_DIVIDE(railgun::Context* ctx, JSVal lhs, JSVal rhs) {
  const double left = lhs.ToNumber(ctx, ERR);
  const double res = left / rhs.ToNumber(ctx, ERR);
  return Extract(res);
}

inline Rep BINARY_MODULO(railgun::Context* ctx, JSVal lhs, JSVal rhs) {
  const double left = lhs.ToNumber(ctx, ERR);
  const double right = rhs.ToNumber(ctx, ERR);
  return Extract(core::math::Modulo(left, right));
}

inline Rep BINARY_LT(railgun::Context* ctx, JSVal lhs, JSVal rhs) {
  const CompareResult res = JSVal::Compare<true>(ctx, lhs, rhs, ERR);
  return Extract(JSVal::Bool(res == CMP_TRUE));
}

inline Rep BINARY_LTE(railgun::Context* ctx, JSVal lhs, JSVal rhs) {
  const CompareResult res = JSVal::Compare<false>(ctx, rhs, lhs, ERR);
  return Extract(JSVal::Bool(res == CMP_FALSE));
}

inline Rep BINARY_GT(railgun::Context* ctx, JSVal lhs, JSVal rhs) {
  const CompareResult res = JSVal::Compare<false>(ctx, rhs, lhs, ERR);
  return Extract(JSVal::Bool(res == CMP_TRUE));
}

inline Rep BINARY_GTE(railgun::Context* ctx, JSVal lhs, JSVal rhs) {
  const CompareResult res = JSVal::Compare<true>(ctx, lhs, rhs, ERR);
  return Extract(JSVal::Bool(res == CMP_FALSE));
}

inline Rep TO_NUMBER(railgun::Context* ctx, JSVal src) {
  const double x = src.ToNumber(ctx, ERR);
  return Extract(x);
}

inline Rep UNARY_NEGATIVE(railgun::Context* ctx, JSVal src) {
  const double x = src.ToNumber(ctx, ERR);
  return Extract(-x);
}

inline JSVal UNARY_NOT(JSVal src) {
  return JSVal::Bool(!src.ToBoolean());
}

inline Rep UNARY_BIT_NOT(railgun::Context* ctx, JSVal src) {
  const double value = src.ToNumber(ctx, ERR);
  return Extract(JSVal::Int32(~core::DoubleToInt32(value)));
}

inline Rep THROW(railgun::Context* ctx, JSVal src) {
  ctx->PendingError()->Report(src);
  IV_LV5_BREAKER_RAISE();
}

inline void POP_ENV(railgun::Frame* frame) {
  frame->set_lexical_env(frame->lexical_env()->outer());
}

inline JSVal RETURN(railgun::Context* ctx, railgun::Frame* frame, JSVal val) {
  if (frame->constructor_call_ && !val.IsObject()) {
    val = frame->GetThis();
  }
  // because of Frame is code frame,
  // first lexical_env is variable_env.
  // (if Eval / Global, this is not valid)
  assert(frame->lexical_env() == frame->variable_env());
  return val;
}

inline void RaiseReferenceError(Symbol name, Error* e) {
  core::UStringBuilder builder;
  builder.Append('"');
  builder.Append(symbol::GetSymbolString(name));
  builder.Append("\" not defined");
  e->Report(Error::Reference, builder.BuildPiece());
}

inline JSEnv* GetEnv(railgun::Context* ctx, JSEnv* env, Symbol name) {
  JSEnv* current = env;
  while (current) {
    if (current->HasBinding(ctx, name)) {
      return current;
    } else {
      current = current->outer();
    }
  }
  return NULL;
}

template<bool STRICT>
inline Rep LOAD_GLOBAL(railgun::Context* ctx,
                       Symbol name, railgun::Instruction* instr) {
  // opcode | (dst | index) | nop | nop
  JSGlobal* global = ctx->global_obj();
  if (instr[2].map == global->map()) {
    // map is cached, so use previous index code
    const JSVal res = global->GetBySlotOffset(ctx, instr[3].u32[0], ERR);
    return Extract(res);
  } else {
    Slot slot;
    if (global->GetOwnPropertySlot(ctx, name, &slot)) {
      // now Own Property Pattern only implemented
      assert(slot.IsCacheable());
      instr[2].map = global->map();
      instr[3].u32[0] = slot.offset();
      const JSVal res = slot.Get(ctx, global, ERR);
      return Extract(res);
    } else {
      instr[2].map = NULL;
      if (JSEnv* current = GetEnv(ctx, ctx->global_env(), name)) {
        const JSVal res = current->GetBindingValue(ctx, name, STRICT, ERR);
        return Extract(res);
      }
      RaiseReferenceError(name, ERR);
      return 0;
    }
  }
}

template<bool STRICT>
inline Rep STORE_GLOBAL(railgun::Context* ctx,
                        JSVal src, Symbol name, railgun::Instruction* instr) {
  // opcode | (src | name) | nop | nop
  JSGlobal* global = ctx->global_obj();
  if (instr[2].map == global->map()) {
    // map is cached, so use previous index code
    global->PutToSlotOffset(ctx, instr[3].u32[0], src, STRICT, ERR);
  } else {
    Slot slot;
    if (global->GetOwnPropertySlot(ctx, name, &slot)) {
      instr[2].map = global->map();
      instr[3].u32[0] = slot.offset();
      global->PutToSlotOffset(ctx, instr[3].u32[0], src, STRICT, ERR);
    } else {
      instr[2].map = NULL;
      if (JSEnv* current = GetEnv(ctx, ctx->global_env(), name)) {
        current->SetMutableBinding(ctx, name, src, STRICT, ERR);
      } else {
        if (STRICT) {
          ctx->PendingError()->Report(Error::Reference,
                    "putting to unresolvable reference "
                    "not allowed in strict reference");
          IV_LV5_BREAKER_RAISE();
        } else {
          ctx->global_obj()->Put(ctx, name, src, STRICT, ERR);
        }
      }
    }
  }
  return 0;
}

inline Rep CALL(railgun::Context* ctx,
                JSVal callee,
                JSVal* offset,
                uint64_t argc_with_this,
                railgun::Frame** out_frame) {
  if (!callee.IsCallable()) {
    ctx->PendingError()->Report(Error::Type, "not callable object");
    IV_LV5_BREAKER_RAISE();
  }
  JSFunction* func = callee.object()->AsCallable();
  if (!func->IsNativeFunction()) {
    // inline call
    railgun::JSVMFunction* vm_func = static_cast<railgun::JSVMFunction*>(func);
    railgun::Code* code = vm_func->code();
    if (code->empty()) {
      return Extract(JSUndefined);
    }
    railgun::Frame* new_frame = ctx->vm()->stack()->NewCodeFrame(
        ctx,
        offset,
        code,
        vm_func->scope(),
        func,
        NULL,  // TODO(Constellation) set precise position
        argc_with_this, false);
    if (!new_frame) {
      ctx->PendingError()->Report(Error::Range, "maximum call stack size exceeded");
      IV_LV5_BREAKER_RAISE();
    }
    new_frame->InitThisBinding(ctx, ERR);
    *out_frame = new_frame;
    return reinterpret_cast<Rep>(code->executable());
  }

  // Native Function
  {
    railgun::detail::VMArguments args(ctx,
                                      offset + (argc_with_this - 1),
                                      argc_with_this - 1);
    const JSVal res = func->Call(&args, args.this_binding(), ERR);
    return Extract(res);
  }
}

inline Rep CONCAT(railgun::Context* ctx, JSVal* src, uint32_t count) {
  return Extract(JSString::New(ctx, src, count));
}

inline Rep TO_PRIMITIVE_AND_TO_STRING(railgun::Context* ctx, JSVal src) {
  const JSVal primitive = src.ToPrimitive(ctx, Hint::NONE, ERR);
  JSString* str = primitive.ToString(ctx, ERR);
  return Extract(str);
}

template<bool CONFIGURABLE>
inline Rep INSTANTIATE_DECLARATION_BINDING(railgun::Context* ctx, JSEnv* env, Symbol name) {
  if (!env->HasBinding(ctx, name)) {
    env->CreateMutableBinding(ctx, name, CONFIGURABLE, ERR);
  } else if (env == ctx->global_env()) {
    JSObject* const go = ctx->global_obj();
    const PropertyDescriptor existing_prop = go->GetProperty(ctx, name);
    if (existing_prop.IsConfigurable()) {
      go->DefineOwnProperty(
          ctx,
          name,
          DataDescriptor(
              JSUndefined,
              ATTR::W | ATTR::E |
              ((CONFIGURABLE) ? ATTR::C : ATTR::NONE)),
          true, ERR);
    } else {
      if (existing_prop.IsAccessorDescriptor()) {
        ctx->PendingError()->Report(Error::Type, "create mutable function binding failed");
        IV_LV5_BREAKER_RAISE();
      }
      const DataDescriptor* const data = existing_prop.AsDataDescriptor();
      if (!data->IsWritable() || !data->IsEnumerable()) {
        ctx->PendingError()->Report(Error::Type, "create mutable function binding failed");
        IV_LV5_BREAKER_RAISE();
      }
    }
  }
  return 0;
}

template<bool CONFIGURABLE, bool STRICT>
inline Rep INSTANTIATE_VARIABLE_BINDING(railgun::Context* ctx, JSEnv* env, Symbol name) {
  // opcode | (name | configurable)
  if (!env->HasBinding(ctx, name)) {
    env->CreateMutableBinding(ctx, name, CONFIGURABLE, ERR);
    env->SetMutableBinding(ctx, name, JSUndefined, STRICT, ERR);
  }
  return 0;
}

inline Rep INCREMENT(railgun::Context* ctx, JSVal src) {
  const double res = src.ToNumber(ctx, ERR);
  return Extract(res + 1);
}


inline Rep DECREMENT(railgun::Context* ctx, JSVal src) {
  const double res = src.ToNumber(ctx, ERR);
  return Extract(res - 1);
}

inline Rep POSTFIX_INCREMENT(railgun::Context* ctx,
                             JSVal val, JSVal* src) {
  const double res = val.ToNumber(ctx, ERR);
  *src = res;
  return Extract(res + 1);
}

inline Rep POSTFIX_DECREMENT(railgun::Context* ctx,
                             JSVal val, JSVal* src) {
  const double res = val.ToNumber(ctx, ERR);
  *src = res;
  return Extract(res - 1);
}

inline bool TO_BOOLEAN(JSVal src) {
  return src.ToBoolean();
}

#undef ERR
} } } }  // namespace iv::lv5::breaker::stub
#endif  // IV_LV5_BREAKER_STUB_H_
