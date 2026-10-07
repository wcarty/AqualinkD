#include "iaqtouch_chemistry.h"

#include <ctype.h>
#include <stdlib.h>
#include <string.h>
#include <strings.h>

static const char *find_field(const char *message, const char *field)
{
  size_t field_length = strlen(field);

  for (const char *cursor = message; *cursor != '\0'; cursor++) {
    if (strncasecmp(cursor, field, field_length) == 0)
      return cursor + field_length;
  }

  return NULL;
}

void iaqt_chemistry_request_init(struct iaqt_chemistry_request *request)
{
  request->pending = true;
}

bool iaqt_chemistry_request_due(const struct iaqt_chemistry_request *request,
                                float ph, int orp, bool startup_complete,
                                bool programming)
{
  return request->pending && (ph <= 0 || orp <= 0) &&
         startup_complete && !programming;
}

void iaqt_chemistry_request_result(struct iaqt_chemistry_request *request,
                                   bool accepted)
{
  if (accepted)
    request->pending = false;
}

bool iaqt_parse_chemistry_message(const char *message, int *orp, float *ph)
{
  const char *orp_field = find_field(message, "ORP");
  const char *ph_field = find_field(message, "PH");
  char *end;

  if (orp_field == NULL || ph_field == NULL)
    return false;

  while (*orp_field != '\0' && !isdigit((unsigned char)*orp_field))
    orp_field++;
  while (*ph_field != '\0' && !isdigit((unsigned char)*ph_field))
    ph_field++;

  long parsed_orp = strtol(orp_field, &end, 10);
  if (end == orp_field)
    return false;

  float parsed_ph = strtof(ph_field, &end);
  if (end == ph_field || parsed_orp <= 0 || parsed_ph <= 0)
    return false;

  *orp = (int)parsed_orp;
  *ph = parsed_ph;
  return true;
}

void iaqt_reset_poll_counter_if_accepted(int *poll_counter, bool accepted)
{
  if (accepted)
    *poll_counter = 0;
}
