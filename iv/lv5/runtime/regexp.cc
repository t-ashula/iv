#include <iv/lv5/error_check.h>
#include <iv/lv5/constructor_check.h>
#include <iv/lv5/arguments.h>
#include <iv/lv5/jsval.h>
#include <iv/lv5/context.h>
#include <iv/lv5/error.h>
#include <iv/lv5/jsobject.h>
#include <iv/lv5/jsregexp.h>
#include <iv/lv5/runtime/regexp.h>
namespace iv {
namespace lv5 {
namespace runtime {

JSVal RegExpConstructor(const Arguments& args, Error* e) {
  const uint32_t args_count = args.size();
  Context* const ctx = args.ctx();
  JSString* pattern = ctx->global_data()->string_empty();
  if (args_count == 0) {
    return JSRegExp::New(ctx);
  } else {
    const JSVal first = args[0];
    if (first.IsObject() && first.object()->IsClass<Class::RegExp>()) {
      if (args_count > 1 && !args[1].IsUndefined()) {
        e->Report(Error::Type,
                  "RegExp Constructor with RegExp object and unknown flags");
        return JSEmpty;
      }
      if (args.IsConstructorCalled()) {
        return JSRegExp::New(ctx, static_cast<JSRegExp*>(first.object()));
      } else {
        return first;
      }
    }
    if (!first.IsUndefined()) {
      pattern = first.ToString(ctx, IV_LV5_ERROR(e));
    }
  }
  JSRegExp* reg;
  if (args_count == 1 || args[1].IsUndefined()) {
    reg = JSRegExp::New(ctx, pattern, IV_LV5_ERROR(e));
  } else {
    JSString* flags = args[1].ToString(ctx, IV_LV5_ERROR(e));
    reg = JSRegExp::New(ctx, pattern, flags, IV_LV5_ERROR(e));
  }
  if (reg->IsValid()) {
    return reg;
  }
  e->Report(Error::Syntax, "RegExp Constructor with invalid pattern");
  return JSEmpty;
}

// section 15.10.6.2 RegExp.prototype.exec(string)
JSVal RegExpExec(const Arguments& args, Error* e) {
  IV_LV5_CONSTRUCTOR_CHECK("RegExp.prototype.exec", args, e);
  Context* const ctx = args.ctx();
  const JSVal obj = args.this_binding();
  if (obj.IsObject() && obj.object()->IsClass<Class::RegExp>()) {
    JSString* string = args.At(0).ToString(ctx, IV_LV5_ERROR(e));
    JSRegExp* const reg = static_cast<JSRegExp*>(obj.object());
    return reg->Exec(ctx, string, e);
  }
  e->Report(Error::Type, "RegExp.prototype.exec is not generic function");
  return JSEmpty;
}

// section 15.10.6.3 RegExp.prototype.test(string)
JSVal RegExpTest(const Arguments& args, Error* e) {
  IV_LV5_CONSTRUCTOR_CHECK("RegExp.prototype.test", args, e);
  Context* const ctx = args.ctx();
  const JSVal obj = args.this_binding();
  if (obj.IsObject() && obj.object()->IsClass<Class::RegExp>()) {
    JSString* string = args.At(0).ToString(ctx, IV_LV5_ERROR(e));
    JSRegExp* const reg = static_cast<JSRegExp*>(obj.object());
    const JSVal result = reg->Exec(ctx, string, IV_LV5_ERROR(e));
    return JSVal::Bool(!result.IsNull());
  }
  e->Report(Error::Type, "RegExp.prototype.test is not generic function");
  return JSEmpty;
}

// section 15.10.6.4 RegExp.prototype.toString()
JSVal RegExpToString(const Arguments& args, Error* e) {
  IV_LV5_CONSTRUCTOR_CHECK("RegExp.prototype.toString", args, e);
  Context* const ctx = args.ctx();
  const JSVal obj = args.this_binding();
  if (obj.IsObject() && obj.object()->IsClass<Class::RegExp>()) {
    JSRegExp* const reg = static_cast<JSRegExp*>(obj.object());
    JSStringBuilder builder;
    builder.Append('/');
    builder.AppendJSString(*(reg->source()));
    builder.Append('/');
    if (reg->global()) {
      builder.Append('g');
    }
    if (reg->ignore()) {
      builder.Append('i');
    }
    if (reg->multiline()) {
      builder.Append('m');
    }
    return builder.Build(ctx, false, e);
  }
  e->Report(Error::Type, "RegExp.prototype.toString is not generic function");
  return JSEmpty;
}

// Not Standard RegExp.prototype.compile(pattern, flags)
// this method is deprecated.
JSVal RegExpCompile(const Arguments& args, Error* e) {
  IV_LV5_CONSTRUCTOR_CHECK("RegExp.prototype.compile", args, e);
  const uint32_t args_count = args.size();
  Context* const ctx = args.ctx();
  const JSVal obj = args.this_binding();
  if (obj.IsObject() && obj.object()->IsClass<Class::RegExp>()) {
    std::u16string pattern;
    std::u16string flags;
    if (args_count != 0) {
      const JSVal first = args[0];
      if (!first.IsUndefined()) {
        JSString* str = first.ToString(ctx, IV_LV5_ERROR(e));
        pattern = str->GetUTF16();
      }
      if (args_count > 1) {
        const JSVal second = args[1];
        if (!second.IsUndefined()) {
          JSString* str = second.ToString(ctx, IV_LV5_ERROR(e));
          flags = str->GetUTF16();
        }
      }
    }

    // Because source, global, ignoreCase, multiline attributes are not
    // writable, I thought that compile method rewrite it is break ES5
    // PropertyDescriptor system.
    // So now, not implement it
    JSRegExp* const reg = static_cast<JSRegExp*>(obj.object());
    // reg->Compile(pattern, flags, IV_LV5_ERROR(e));
    return reg;
  }
  e->Report(Error::Type, "RegExp.prototype.compile is not generic function");
  return JSEmpty;
}

} } }  // namespace iv::lv5::runtime
