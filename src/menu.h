#pragma once

#include "pebble.h"
#include "event.h"

typedef struct MenuCallbacks {
    void (*select_click)(MenuLayer*, MenuIndex*, void*);
    void (*remove_callback)(void*);
} MenuCallbacks;

typedef struct Menu {
    int id;
    struct Menu *menu;

    int size;
    char *title;
    char **row_title;
    char **row_subtitle;

    MenuCallbacks callbacks;
    void *data_int;
    void **data_char;

    Window *window;
    MenuLayer *layer;
    uint32_t load_image_resource_id;
    GBitmap *load_image;
    BitmapLayer *load_layer;
} Menu;

extern Menu* menu_create(uint32_t load_image_resource_id, MenuCallbacks callbacks);
extern void menu_add_row(void *menu, char *title, Event_Row *queue, int queue_size);
extern void menu_update_row(void *menu, int index, char *title, int data_int);

extern void menu_init_text_scroll(Menu **menu);
extern void menu_deinit_text_scroll();
