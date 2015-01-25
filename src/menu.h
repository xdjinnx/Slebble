#pragma once

#include "pebble.h"

typedef struct MenuCallbacks {
    void (*select_click)(MenuLayer*, MenuIndex*, void*);
    void (*remove_callback)(void*);
} MenuCallbacks;

typedef struct Menu {
    struct Menu *menu;

    int size;
    char *title;
    char *row_title;
    char *row_subtitle;

    MenuCallbacks callbacks;
    void *data;

    Window *window;
    MenuLayer *layer;
    uint32_t load_image_resource_id;
    GBitmap *load_image;
    BitmapLayer *load_layer;
} Menu;

extern Menu* menu_create(uint32_t load_image_resource_id, MenuCallbacks callbacks);