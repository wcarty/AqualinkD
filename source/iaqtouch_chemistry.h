#ifndef IAQTOUCH_CHEMISTRY_H_
#define IAQTOUCH_CHEMISTRY_H_

#include <stdbool.h>

struct iaqt_chemistry_request {
  bool pending;
};

void iaqt_chemistry_request_init(struct iaqt_chemistry_request *request);
bool iaqt_chemistry_request_due(const struct iaqt_chemistry_request *request,
                                float ph, int orp, bool startup_complete,
                                bool programming);
void iaqt_chemistry_request_result(struct iaqt_chemistry_request *request,
                                   bool accepted);
bool iaqt_parse_chemistry_message(const char *message, int *orp, float *ph);
void iaqt_reset_poll_counter_if_accepted(int *poll_counter, bool accepted);

#endif
