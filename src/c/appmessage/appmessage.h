#pragma once

#include "pebble.h"
#include "../utils/queue.h"

extern void send_appmessage(int index, int step);
extern void update_appmessage();
extern void event_set_click_data(char *data);
extern void event_register_app_message();
