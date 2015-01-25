#pragma once

#include "pebble.h"

typedef struct Menu {
    struct Menu *menu;

    int size;
    char *title;
    char *row_title;
    char *row_subtitle;

    void (*remove_callback)(struct Menu*);
    void *data;

    Window *window;
    MenuLayer *layer;
    uint32_t load_image_resource_id;
    GBitmap *load_image;
    BitmapLayer *load_layer;
} Menu;

extern Menu* menu_create(void (*remove_callback)(Menu*), uint32_t load_image_resource_id);