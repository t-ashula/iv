#ifndef IV_DTOA_H_
#define IV_DTOA_H_
#include <iv/dtoa_bigint.h>
extern "C" char* dtoa(double d, int mode, int ndigits,
                      int *decpt, int *sign, char **rve);
extern "C" void freedtoa(char *s);

namespace v8 {
namespace internal {

// Printing floating-point numbers quickly and accurately with integers.
// Florian Loitsch, PLDI 2010.
extern char* DoubleToCString(double v, char* buffer, int buflen);

} }  // namespace v8::internal
namespace iv {
namespace core {

using v8::internal::DoubleToCString;

} }  // namespace iv::core::dtoa
#endif  // IV_DTOA_H_
