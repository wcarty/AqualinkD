#ifndef TELEMETRY_H_
#define TELEMETRY_H_

#include <stdbool.h>
#include <time.h>

#include "aqualink.h"

bool update_source_timestamp(time_t *last_update, volatile bool *is_dirty,
                             time_t acquired_at);
long long source_age_seconds(time_t acquired_at, time_t now);
bool update_panel_timestamp(struct aqualinkdata *aqdata, time_t acquired_at);
bool update_air_temperature(struct aqualinkdata *aqdata, int temperature,
                            time_t acquired_at);
bool update_pump_timestamp(struct aqualinkdata *aqdata, int pump_index,
                           time_t acquired_at);
bool update_swg_timestamp(struct aqualinkdata *aqdata, time_t acquired_at);

#endif
