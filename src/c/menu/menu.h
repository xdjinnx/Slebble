#pragma once

#include "../utils/queue.h"
#include "pebble.h"
#include "progress_layer/progress_layer.h"
#include "row.h"

typedef struct MenuCallbacks {
    void (*select_click)(MenuLayer *, MenuIndex *, void *);
    void (*remove_callback)(void *);
} MenuCallbacks;

typedef struct Menu {
    struct Menu *menu;

    uint16_t size;
    char *title;
    Row **row;

    MenuCallbacks callbacks;

    Window *window;
    MenuLayer *layer;
    uint32_t load_image_resource_id;
    GBitmap *load_image;
    BitmapLayer *load_layer;
    ProgressLayer *progress_layer;
} Menu;

extern Menu *menu_create(uint32_t load_image_resource_id, MenuCallbacks callbacks);
extern void menu_add_rows(Menu *menu, char *title, Queue *queue);
extern void menu_increment_loading_progress(Menu *menu, int16_t progress);