#pragma once

#include "pebble.h"

typedef struct Menu {
    struct Menu *menu;
    Window *window;
    MenuLayer *layer;
    GBitmap *load_image;
    BitmapLayer *load_layer;
} Menu;

extern Menu* menu_create();