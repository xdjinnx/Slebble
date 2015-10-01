#pragma once

#include "pebble.h"

typedef struct Event_Row {
    char title[32];
    char subtitle[32];
    int data_int;
    char data_char[32];
} Event_Row;

typedef void (*view_func)(void*, char*, Event_Row*, int);

extern void send_appmessage(int index, int step);
extern void update_appmessage();
extern void event_set_click_data(char* data);
extern void event_set_view_func(void *view, view_func func_ptr);
extern void event_tick_handler(int size, void *data);
extern void event_register_app_message();
