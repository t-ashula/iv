#ifndef _IV_DETAIL_ARRAY_H_
#define _IV_DETAIL_ARRAY_H_
#include "platform.h"

#if defined(IV_COMPILER_MSVC) || defined(__GXX_EXPERIMENTAL_CXX0X__)
#include <array>

#if defined(IV_COMPILER_MSVC) && !defined(IV_COMPILER_MSVC_10)
namespace std { using namespace tr1; }
#endif

#else

#include <tr1/array>
namespace std { using namespace tr1; }

#endif

#endif  // _IV_DETAIL_ARRAY_H_