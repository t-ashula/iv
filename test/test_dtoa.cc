#include <cstring>
#include <iostream>
#include <tr1/array>
#include <gtest/gtest.h>
#include "dtoa.h"
#include "dtoa_fixed.h"
#include "dtoa_precision.h"
#include "dtoa_shortest.h"
namespace {

static void TrimRepresentation(char* buf) {
  const int len = std::strlen(buf);
  int i;
  for (i = len - 1; i >= 0; --i) {
    if (buf[i] != '0') {
      break;
    }
  }
  buf[i + 1] = '\0';
}

class StringDToA : public iv::core::dtoa::DToA<StringDToA, std::string> {
 public:
  friend class DToA<StringDToA, std::string>;

 private:
  std::string Create(const char* str) const {
    return std::string(str);
  }
};

}  // namespace anonymous

TEST(DToACase, DToAGayFixed) {
  // dtoa(v, 3, number_digits, &decimal_point, &sign, NULL);
  std::tr1::array<char, 100> buffer;
  bool sign;
  int exponent;
  unsigned precision;
  // 6.6336520115995179509212087e-08
  for (FixedTestContainerType::const_iterator it = FixedTestContainer().begin(),
       last = FixedTestContainer().end(); it != last; ++it) {
    std::fill(buffer.begin(), buffer.end(), '\0');
    const PrecomputedFixed current_test = *it;
    double v = current_test.v;
    const int number_digits = current_test.number_digits;
    iv::core::dtoa::DoubleToASCII<false, false, true, false>(
        buffer.data(), v, number_digits, &sign, &exponent, &precision);
    EXPECT_EQ(0, sign);  // All precomputed numbers are positive.
    TrimRepresentation(buffer.data());
    EXPECT_STREQ(current_test.representation, buffer.data());
    if (exponent < 0) {
      EXPECT_EQ(current_test.decimal_point, -(-exponent - 1));
    } else {
      unsigned dec = exponent + 1;
      if (precision > dec) {
        EXPECT_EQ(current_test.decimal_point, dec);
      } else {
        // EXPECT_EQ(current_test.decimal_point, dec);
      }
    }
  }
}

TEST(DToACase, DToAGayPrecision) {
  // dtoa(v, 2, number_digits, &decimal_point, &sign, NULL);
  std::tr1::array<char, 100> buffer;
  bool sign;
  int exponent;
  unsigned precision;
  for (PrecisionTestContainerType::const_iterator it = PrecisionTestContainer().begin(),
       last = PrecisionTestContainer().end(); it != last; ++it) {
    std::fill(buffer.begin(), buffer.end(), '\0');
    const PrecomputedPrecision current_test = *it;
    double v = current_test.v;
    const int number_digits = current_test.number_digits;
    iv::core::dtoa::DoubleToASCII<false, true, false, false>(
        buffer.data(), v, number_digits, &sign, &exponent, &precision);
    EXPECT_EQ(0, sign);  // All precomputed numbers are positive.
    EXPECT_EQ(current_test.decimal_point, exponent + 1);
    EXPECT_GE(number_digits, std::strlen(buffer.data()));
    TrimRepresentation(buffer.data());
    EXPECT_STREQ(current_test.representation, buffer.data());
  }
}

TEST(DToACase, DToAGayShortest) {
  // decimal_rep = dtoa(v, 0, 0, &decimal_point, &sign, NULL);
  std::tr1::array<char, 100> buffer;
  bool sign;
  int exponent;
  unsigned precision;
  // {1.6525979369510882500000000e+15, "16525979369510882", 16},
  for (ShortestTestContainerType::const_iterator it = ShortestTestContainer().begin(),
       last = ShortestTestContainer().end(); it != last; ++it) {
    std::fill(buffer.begin(), buffer.end(), '\0');
    const PrecomputedShortest current_test = *it;
    double v = current_test.v;
    iv::core::dtoa::DoubleToASCII<true, false, false, true>(
        buffer.data(), v, 0, &sign, &exponent, &precision);
    EXPECT_EQ(0, sign);  // All precomputed numbers are positive.
    EXPECT_EQ(current_test.decimal_point, exponent + 1);
    TrimRepresentation(buffer.data());
    EXPECT_STREQ(current_test.representation, buffer.data());
  }
}