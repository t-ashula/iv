#ifndef IV_LV5_ERROR_H_
#define IV_LV5_ERROR_H_
#include <algorithm>
#include <cstdio>
#include <iv/detail/memory.h>
#include <iv/ustring.h>
#include <iv/noncopyable.h>
#include <iv/static_assert.h>
#include <iv/stringpiece.h>
#include <iv/lv5/jsval_fwd.h>
namespace iv {
namespace lv5 {

class Context;
class Error {
 public:
  typedef Error this_type;
  typedef void (Error::*bool_type)() const;
  typedef std::vector<core::UString> Stack;

  enum Code {
    Normal = 0,
    Eval,
    Range,
    Reference,
    Syntax,
    Type,
    URI,
    User
  };

  Error()
    : code_(Normal),
      value_(),
      detail_(),
      stack_() {
  }

  void Report(Code code, const core::StringPiece& str) {
    code_ = code;
    detail_.assign(str.begin(), str.end());
  }

  void Report(Code code, const core::UStringPiece& str) {
    code_ = code;
    detail_.assign(str.begin(), str.end());
  }

  void Report(const JSVal& val) {
    code_ = User;
    value_ = val;
  }

  void Clear() {
    code_ = Normal;
    stack_.reset();
  }

  Code code() const {
    return code_;
  }

  const core::UString detail() const {
    return detail_;
  }

  const JSVal& value() const {
    return value_;
  }

  operator bool_type() const {
    return code_ != Normal ?
        &Error::this_type_does_not_support_comparisons : 0;
  }

  void set_stack(std::shared_ptr<Stack> stack) {
    stack_ = stack;
  }

  std::shared_ptr<Stack> stack() const { return stack_; }

  // This function is implemented at jserror.h
  bool RequireMaterialize(Context* ctx) const;

  // This function is implemented at jserror.h
  JSVal Detail(Context* ctx);

  // This function is implemented at jserror.h
  void Dump(Context* ctx, FILE* out);

 private:
  void this_type_does_not_support_comparisons() const { }

  Code code_;
  JSVal value_;
  core::UString detail_;
  std::shared_ptr<Stack> stack_;
};

} }  // namespace iv::lv5
#endif  // IV_LV5_ERROR_H_
