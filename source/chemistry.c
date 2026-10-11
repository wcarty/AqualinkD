#include "chemistry.h"

bool update_chemistry_reading(struct aqualinkdata *aqdata, int orp, float ph,
                              time_t acquired_at)
{
  if (orp <= 0 || ph <= 0 || acquired_at <= 0)
    return false;

  bool changed = aqdata->orp != orp || aqdata->ph != ph;

  if (aqdata->orp != orp)
    aqdata->orp = orp;
  if (aqdata->ph != ph)
    aqdata->ph = ph;
  if (aqdata->chemistry_last_update != acquired_at)
    aqdata->chemistry_last_update = acquired_at;
  if (changed)
    aqdata->is_dirty = true;
  return changed;
}

long long chemistry_age_seconds(time_t acquired_at, time_t now)
{
  if (acquired_at <= 0)
    return -1;
  if (now <= acquired_at)
    return 0;
  return (long long)(now - acquired_at);
}
