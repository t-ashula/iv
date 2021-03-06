#ifndef IV_LV5_BIND_H_
#define IV_LV5_BIND_H_
#include <iv/string_view.h>
#include <iv/lv5/jsval.h>
#include <iv/lv5/error.h>
#include <iv/lv5/jsobject_fwd.h>
#include <iv/lv5/jsfunction_fwd.h>
#include <iv/lv5/jssymbol.h>
#include <iv/lv5/arguments.h>
#include <iv/lv5/attributes.h>
#include <iv/lv5/context.h>
namespace iv {
namespace lv5 {

namespace bind {

class Scope {
 public:
  explicit Scope(Context* ctx) : ctx_(ctx) { }

 protected:

  Context* ctx_;
};

class Object : public Scope {
 public:
  Object(Context* ctx, JSObject* obj)
      : Scope(ctx), obj_(obj), e_() { }

  Object& cls(const Class* cls) {
    obj_->set_cls(cls);
    return *this;
  }

  template<JSVal (*func)(const Arguments&, Error*), std::size_t n>
  Object& def(JSSymbol* symbol) {
    return def<func, n>(symbol->symbol());
  }

  template<JSVal (*func)(const Arguments&, Error*), std::size_t n>
  Object& def(const core::string_view& string) {
    return def<func, n>(ctx_->Intern(string));
  }

  template<JSVal (*func)(const Arguments&, Error*), std::size_t n>
  Object& def(const Symbol& name) {
    obj_->DefineOwnProperty(
      ctx_, name,
      DataDescriptor(
          JSInlinedFunction<func, n>::New(ctx_, name),
          ATTR::W | ATTR::C),
      false, &e_);
    return *this;
  }

  template<JSVal (*func)(const Arguments&, Error*), std::size_t n>
  Object& def(const core::string_view& string, int attr) {
    return def<func, n>(ctx_->Intern(string), attr);
  }

  template<JSVal (*func)(const Arguments&, Error*), std::size_t n>
  Object& def(const Symbol& name, int attr) {
    obj_->DefineOwnProperty(
      ctx_, name,
      DataDescriptor(
          JSInlinedFunction<func, n>::New(ctx_, name),
          attr),
      false, &e_);
    return *this;
  }

  Object& def(const core::string_view& string, JSVal val) {
    return def(ctx_->Intern(string), val);
  }

  Object& def(const Symbol& name, JSVal val) {
    obj_->DefineOwnProperty(
      ctx_, name,
      DataDescriptor(val, ATTR::NONE),
      false, &e_);
    return *this;
  }

  Object& def(JSSymbol* symbol, JSVal val, int attr) {
    return def(symbol->symbol(), val, attr);
  }

  Object& def(const core::string_view& string, JSVal val, int attr) {
    return def(ctx_->Intern(string), val, attr);
  }

  Object& def(const Symbol& name, JSVal val, int attr) {
    obj_->DefineOwnProperty(
      ctx_, name,
      DataDescriptor(val, attr),
      false, &e_);
    return *this;
  }

  Object& def_accessor(const core::string_view& string,
                       JSObject* getter,
                       JSObject* setter, int attr) {
    return def_accessor(ctx_->Intern(string), getter, setter, attr);
  }

  Object& def_accessor(const Symbol& name,
                       JSObject* getter, JSObject* setter, int attr) {
    obj_->DefineOwnProperty(
      ctx_, name,
      AccessorDescriptor(getter, setter, attr),
      false, &e_);
    return *this;
  }

  Object& def_getter(const core::string_view& string,
                     JSObject* getter, int attr) {
    return def_accessor(ctx_->Intern(string), getter, nullptr, attr);
  }

  Object& def_getter(const Symbol& name, JSObject* getter, int attr) {
    return def_accessor(name, getter, nullptr, attr);
  }

  template<JSVal (*func)(const Arguments&, Error*), std::size_t n>
  Object& def_getter(const core::string_view& string) {
    return def_getter<func, n>(ctx_->Intern(string));
  }

  template<JSVal (*func)(const Arguments&, Error*), std::size_t n>
  Object& def_getter(const Symbol& name) {
    obj_->DefineOwnProperty(
      ctx_, name,
      AccessorDescriptor(
          JSInlinedFunction<func, n>::New(ctx_, name), nullptr,
          ATTR::C | ATTR::UNDEF_SETTER),
      false, &e_);
    return *this;
  }

  template<JSVal (*func)(const Arguments&, Error*), std::size_t n>
  Object& def_getter(const core::string_view& string, int attr) {
    return def_getter<func, n>(ctx_->Intern(string), attr);
  }

  template<JSVal (*func)(const Arguments&, Error*), std::size_t n>
  Object& def_getter(const Symbol& name, int attr) {
    obj_->DefineOwnProperty(
      ctx_, name,
      AccessorDescriptor(
          JSInlinedFunction<func, n>::New(ctx_, name), nullptr,
          attr),
      false, &e_);
    return *this;
  }

  Object& def_setter(const core::string_view& string,
                     JSObject* setter, int attr) {
    return def_accessor(ctx_->Intern(string), nullptr, setter, attr);
  }

  Object& def_setter(const Symbol& name, JSObject* setter, int attr) {
    return def_accessor(name, nullptr, setter, attr);
  }

  template<JSVal (*func)(const Arguments&, Error*), std::size_t n>
  Object& def_setter(const core::string_view& string) {
    return def_setter<func, n>(ctx_->Intern(string));
  }

  template<JSVal (*func)(const Arguments&, Error*), std::size_t n>
  Object& def_setter(const Symbol& name) {
    obj_->DefineOwnProperty(
      ctx_, name,
      AccessorDescriptor(
          nullptr, JSInlinedFunction<func, n>::New(ctx_, name),
          ATTR::C | ATTR::UNDEF_GETTER),
      false, &e_);
    return *this;
  }

  template<JSVal (*func)(const Arguments&, Error*), std::size_t n>
  Object& def_setter(const core::string_view& string, int attr) {
    return def_setter<func, n>(ctx_->Intern(string), attr);
  }

  template<JSVal (*func)(const Arguments&, Error*), std::size_t n>
  Object& def_setter(const Symbol& name, int attr) {
    obj_->DefineOwnProperty(
      ctx_, name,
      AccessorDescriptor(
          nullptr, JSInlinedFunction<func, n>::New(ctx_, name),
          attr),
      false, &e_);
    return *this;
  }

  JSObject* content() const {
    return obj_;
  }

  Error* error() {
    return &e_;
  }

 private:
  JSObject* obj_;
  Error::Dummy e_;
};

} } }  // namespace iv::lv5::bind
#endif  // IV_LV5_BIND_H_
