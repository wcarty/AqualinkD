#ifndef CHEMISTRY_H_
#define CHEMISTRY_H_

#include <stdbool.h>
#include <time.h>

#include "aqualink.h"

bool update_chemistry_reading(struct aqualinkdata *aqdata, int orp, float ph,
                              time_t acquired_at);
long long chemistry_age_seconds(time_t acquired_at, time_t now);

#endif
