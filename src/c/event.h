#pragma once

#include "pebble.h"
#include "queue.h"
#include "menu/row.h"

typedef void (*view_func)(void *, char *, Queue *);

extern void send_appmessage(int index, int step);
extern void update_appmessage();
extern void event_set_click_data(char *data);
extern void event_set_view_func(void *view, view_func func_ptr);
extern void event_register_app_message();
