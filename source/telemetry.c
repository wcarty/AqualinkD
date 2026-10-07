#include "telemetry.h"

bool update_source_timestamp(time_t *last_update, volatile bool *is_dirty,
                             time_t acquired_at)
{
  if (last_update == NULL || is_dirty == NULL || acquired_at <= 0)
    return false;
  if (*last_update == acquired_at)
    return false;

  *last_update = acquired_at;
  *is_dirty = true;
  return true;
}

long long source_age_seconds(time_t acquired_at, time_t now)
{
  if (acquired_at <= 0)
    return -1;
  if (now <= acquired_at)
    return 0;
  return (long long)(now - acquired_at);
}

bool update_panel_timestamp(struct aqualinkdata *aqdata, time_t acquired_at)
{
  if (aqdata == NULL)
    return false;
  return update_source_timestamp(&aqdata->panel_last_update, &aqdata->is_dirty,
                                 acquired_at);
}

bool update_air_temperature(struct aqualinkdata *aqdata, int temperature,
                            time_t acquired_at)
{
  if (aqdata == NULL || temperature == TEMP_UNKNOWN || acquired_at <= 0)
    return false;

  bool changed = aqdata->air_temp != temperature;
  if (changed)
    aqdata->air_temp = temperature;
  if (update_source_timestamp(&aqdata->air_temp_last_update, &aqdata->is_dirty,
                              acquired_at))
    changed = true;
  if (changed)
    aqdata->is_dirty = true;
  return changed;
}

bool update_pump_timestamp(struct aqualinkdata *aqdata, int pump_index,
                           time_t acquired_at)
{
  if (aqdata == NULL || pump_index < 0 || pump_index >= aqdata->num_pumps)
    return false;
  return update_source_timestamp(&aqdata->pumps[pump_index].last_update,
                                 &aqdata->is_dirty, acquired_at);
}

bool update_swg_timestamp(struct aqualinkdata *aqdata, time_t acquired_at)
{
  if (aqdata == NULL)
    return false;
  return update_source_timestamp(&aqdata->swg_last_update, &aqdata->is_dirty,
                                 acquired_at);
}
