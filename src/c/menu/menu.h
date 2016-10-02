#pragma once

#include "pebble.h"
#include "../utils/queue.h"
#include "row.h"

typedef struct MenuCallbacks {
    void (*select_click)(MenuLayer *, MenuIndex *, void *);
    void (*remove_callback)(void *);
} MenuCallbacks;

typedef struct Menu {
    struct Menu *menu;

    uint16_t size;
    char *title;
    void **data;

    converter converter;
    MenuCallbacks callbacks;

    Window *window;
    MenuLayer *layer;
    uint32_t load_image_resource_id;
    GBitmap *load_image;
    BitmapLayer *load_layer;
} Menu;

extern Menu *menu_create(uint32_t load_image_resource_id, MenuCallbacks callbacks);
extern void menu_add_data(void *menu, char *title, Queue *queue, converter converter);
