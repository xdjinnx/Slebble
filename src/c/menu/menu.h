#pragma once

#include "pebble.h"
#include "../queue.h"
#include "row.h"

typedef Row* (*converter)(void *);

typedef struct MenuCallbacks {
    void (*select_click)(MenuLayer *, MenuIndex *, void *);
    void (*remove_callback)(void *);
} MenuCallbacks;

typedef struct Menu {
    uint16_t id;
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

extern Menu *menu_create(uint32_t load_image_resource_id, converter converter, MenuCallbacks callbacks);
extern void menu_add_data(void *menu, char *title, Queue *queue);

extern void menu_init_text_scroll(Menu **menu);
extern void menu_deinit_text_scroll();
