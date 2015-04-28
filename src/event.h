#pragma once

#include "pebble.h"

typedef void (*update_view_func)(void*, int, int, char*, int, char*, char*, int, char*);

extern void send_appmessage(int index, int step);
extern void update_appmessage();
extern void event_set_click_data(char* data);
extern void event_set_view_update(void *view, update_view_func func_ptr);
extern void event_tick_handler(int size, void *data);
extern void in_received_handler(DictionaryIterator *iter, void *context);
extern void in_dropped_handler(AppMessageResult reason, void *context);