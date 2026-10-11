#include <assert.h>
#include <stdbool.h>
#include <stdio.h>

#include "../source/iaqtouch_chemistry.h"
#include "../source/chemistry.h"

static void test_unknown_chemistry_with_free_queue(void)
{
  struct iaqt_chemistry_request request;
  iaqt_chemistry_request_init(&request);

  assert(iaqt_chemistry_request_due(&request, -999, -999, true, false));
  iaqt_chemistry_request_result(&request, true);
  assert(!request.pending);
  assert(!iaqt_chemistry_request_due(&request, -999, -999, true, false));
}

static void test_unknown_chemistry_with_busy_queue_retries(void)
{
  struct iaqt_chemistry_request request;
  iaqt_chemistry_request_init(&request);

  assert(iaqt_chemistry_request_due(&request, -999, -999, true, false));
  iaqt_chemistry_request_result(&request, false);
  assert(request.pending);
  assert(iaqt_chemistry_request_due(&request, -999, -999, true, false));
}

static void test_known_chemistry_does_not_request_status(void)
{
  struct iaqt_chemistry_request request;
  iaqt_chemistry_request_init(&request);

  assert(!iaqt_chemistry_request_due(&request, 7.5f, 620, true, false));
}

static void test_waits_for_startup_and_programming(void)
{
  struct iaqt_chemistry_request request;
  iaqt_chemistry_request_init(&request);

  assert(!iaqt_chemistry_request_due(&request, -999, -999, false, false));
  assert(!iaqt_chemistry_request_due(&request, -999, -999, true, true));
}

static void test_captured_chemistry_message(void)
{
  int orp = 0;
  float ph = 0;

  assert(iaqt_parse_chemistry_message("ORP:620 pH:7.5", &orp, &ph));
  assert(orp == 620);
  assert(ph == 7.5f);
}

static void test_rejected_request_does_not_reset_poll_counter(void)
{
  int poll_counter = 199;

  iaqt_reset_poll_counter_if_accepted(&poll_counter, false);
  assert(poll_counter == 199);
  iaqt_reset_poll_counter_if_accepted(&poll_counter, true);
  assert(poll_counter == 0);
}

static void test_acquisition_timestamp_tracks_unchanged_readings(void)
{
  struct aqualinkdata aqdata = {
    .ph = -999,
    .orp = -999,
    .chemistry_last_update = 0,
    .is_dirty = false
  };

  assert(update_chemistry_reading(&aqdata, 620, 7.5f, 1000));
  assert(aqdata.ph == 7.5f);
  assert(aqdata.orp == 620);
  assert(aqdata.chemistry_last_update == 1000);
  assert(aqdata.is_dirty);

  aqdata.is_dirty = false;
  assert(!update_chemistry_reading(&aqdata, 620, 7.5f, 1300));
  assert(aqdata.chemistry_last_update == 1300);
  assert(!aqdata.is_dirty);
  assert(chemistry_age_seconds(aqdata.chemistry_last_update, 1600) == 300);
}

static void test_invalid_chemistry_does_not_advance_timestamp(void)
{
  struct aqualinkdata aqdata = {
    .ph = 7.5f,
    .orp = 620,
    .chemistry_last_update = 1000,
    .is_dirty = false
  };

  assert(!update_chemistry_reading(&aqdata, 0, 7.5f, 1300));
  assert(aqdata.chemistry_last_update == 1000);
  assert(!aqdata.is_dirty);
  assert(chemistry_age_seconds(0, 1600) == -1);
  assert(chemistry_age_seconds(1700, 1600) == 0);
}

int main(void)
{
  test_unknown_chemistry_with_free_queue();
  test_unknown_chemistry_with_busy_queue_retries();
  test_known_chemistry_does_not_request_status();
  test_waits_for_startup_and_programming();
  test_captured_chemistry_message();
  test_rejected_request_does_not_reset_poll_counter();
  test_acquisition_timestamp_tracks_unchanged_readings();
  test_invalid_chemistry_does_not_advance_timestamp();
  puts("iaqtouch chemistry acquisition tests passed");
  return 0;
}
