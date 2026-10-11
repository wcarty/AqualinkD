#include <assert.h>
#include <stdbool.h>
#include <stdio.h>

#include "../source/telemetry.h"

static void test_source_timestamp_tracks_unchanged_acquisitions(void)
{
  time_t timestamp = 0;
  bool dirty = false;

  assert(update_source_timestamp(&timestamp, &dirty, 1000));
  assert(timestamp == 1000);
  assert(!dirty);

  dirty = false;
  assert(update_source_timestamp(&timestamp, &dirty, 1300));
  assert(timestamp == 1300);
  assert(!dirty);
  assert(source_age_seconds(timestamp, 1600) == 300);
}

static void test_invalid_timestamp_is_ignored(void)
{
  time_t timestamp = 1000;
  bool dirty = false;

  assert(!update_source_timestamp(&timestamp, &dirty, 0));
  assert(timestamp == 1000);
  assert(!dirty);
  assert(source_age_seconds(0, 1600) == -1);
  assert(source_age_seconds(1700, 1600) == 0);
}

static void test_air_temperature_timestamp(void)
{
  struct aqualinkdata aqdata = {
    .air_temp = 88,
    .air_temp_last_update = 1000,
    .is_dirty = false
  };

  assert(!update_air_temperature(&aqdata, 88, 1300));
  assert(aqdata.air_temp == 88);
  assert(aqdata.air_temp_last_update == 1300);
  assert(!aqdata.is_dirty);

  aqdata.is_dirty = false;
  assert(!update_air_temperature(&aqdata, TEMP_UNKNOWN, 1600));
  assert(aqdata.air_temp_last_update == 1300);
  assert(!aqdata.is_dirty);
}

static void test_pump_timestamp_validation(void)
{
  struct aqualinkdata aqdata = {
    .num_pumps = 1,
    .is_dirty = false
  };

  assert(update_pump_timestamp(&aqdata, 0, 1000));
  assert(aqdata.pumps[0].last_update == 1000);
  assert(!aqdata.is_dirty);

  aqdata.is_dirty = false;
  assert(!update_pump_timestamp(&aqdata, 1, 1300));
  assert(aqdata.pumps[0].last_update == 1000);
  assert(!aqdata.is_dirty);
}

static void test_panel_and_swg_timestamps(void)
{
  struct aqualinkdata aqdata = {0};

  assert(update_panel_timestamp(&aqdata, 1000));
  assert(aqdata.panel_last_update == 1000);
  aqdata.is_dirty = false;

  assert(update_swg_timestamp(&aqdata, 1100));
  assert(aqdata.swg_last_update == 1100);
  assert(!aqdata.is_dirty);
}

int main(void)
{
  test_source_timestamp_tracks_unchanged_acquisitions();
  test_invalid_timestamp_is_ignored();
  test_air_temperature_timestamp();
  test_pump_timestamp_validation();
  test_panel_and_swg_timestamps();
  puts("telemetry timestamp tests passed");
  return 0;
}
