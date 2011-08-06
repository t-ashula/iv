// this syslog header file only used in debug
#ifndef _IV_SYSLOG_H_
#define _IV_SYSLOG_H_
#include <cstdio>
#include <string>
#include <syslog.h>
#include "noncopyable.h"
namespace iv {
namespace core {

class Syslog : private Noncopyable<> {
 public:
  explicit Syslog(const std::string& ident) {
    openlog(ident.c_str(), LOG_CONS | LOG_PID, LOG_USER);
  }

  ~Syslog() {
    closelog();
  }

  template<int priority>
  void Log(const std::string& message) {
    syslog(priority, "%s", message.c_str());
  }
};

} }  // namespace iv::core
#endif  // _IV_SYSLOG_H_