#pragma once

#include "pebble.h"
#include "row.h"
#include "queue.h"

typedef struct MenuCallbacks {
    void (*select_click)(MenuLayer*, MenuIndex*, void*);
    void (*remove_callback)(void*);
} MenuCallbacks;

typedef struct Menu {
    int id;
    struct Menu *menu;

    int size;
    char *title;
    Row **row;

    MenuCallbacks callbacks;

    Window *window;
    MenuLayer *layer;
    uint32_t load_image_resource_id;
    GBitmap *load_image;
    BitmapLayer *load_layer;
} Menu;

extern Menu* menu_create(uint32_t load_image_resource_id, MenuCallbacks callbacks);
extern void menu_add_rows(void *menu, char *title, Queue *queue);

extern void menu_init_text_scroll(Menu **menu);
extern void menu_deinit_text_scroll();
