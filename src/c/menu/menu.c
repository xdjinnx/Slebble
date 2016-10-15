#include "menu.h"

#include "handler/handler.h"
#include "text_scroll/text_scroll.h"

StatusBarLayer *status_bar;

void menu_allocation(Menu *menu, int size) {
    if (menu->size == 0) {
        menu->data = calloc(size, sizeof(void *));
    }

    if (menu->size != size && menu->size != 0) {
        if (menu->size > size) {
            for (int i = size; i < menu->size; i++) {
                free(menu->data[i]);
            }
        }

        menu->data = realloc(menu->data, sizeof(void *) * size);
    }

    menu->size = size;
}

void free_data(Menu *menu) {
    if (menu->size == 0) {
        return;
    }

    for (int i = 0; i < menu->size; i++) {
        free(menu->data[i]);
    }
}

void hide_load_image(Menu *menu, bool vibe) {
    if (layer_get_hidden(bitmap_layer_get_layer(menu->load_layer))) {
        return;
    }

    text_scroll_reset();
    menu_layer_reload_data(menu->layer);
    layer_set_hidden(bitmap_layer_get_layer(menu->load_layer), true);
    layer_set_hidden(menu->progress_layer, true);
    menu_layer_set_click_config_onto_window(menu->layer, menu->window);

    if (vibe) {
        vibes_short_pulse();
    }
}

// Should be able to send an array pointer.
void menu_add_data(void *menu_void, char *title, Queue *queue, converter converter) {
    if (menu_void == NULL) {
        return;
    }

    Menu *menu = (Menu *)menu_void;
    if (menu->size > 0 && strcmp(menu->title, title) != 0) {
        return;
    }

    menu->title = title;
    menu->converter = converter;

    free_data(menu);
    menu_allocation(menu, queue_length(queue));

    for (int i = 0; !queue_empty(queue); i++) {
        menu->data[i] = queue_pop(queue);
    }

    menu_layer_reload_data(menu->layer);
    hide_load_image(menu, true);
}

void window_unload(Window *window) {
    Menu *menu = window_get_user_data(window);
    if (menu->menu == NULL) {
        menu_deinit_text_scroll();
    }

    Menu *ret = menu->menu;

    text_scroll_reset();

    menu->callbacks.remove_callback(ret);

    window_stack_remove(window, true);
    window_destroy(window);
    menu_layer_destroy(menu->layer);
    bitmap_layer_destroy(menu->load_layer);
    gbitmap_destroy(menu->load_image);
    progress_layer_destroy(menu->progress_layer);

    free_data(menu);
    free(menu->data);

    if (ret == NULL) {
        status_bar_layer_destroy(status_bar);
    }

    free(menu);
}

void window_load(Window *window) {
    Menu *menu = window_get_user_data(window);

    Layer *window_layer = window_get_root_layer(window);
    GRect bounds = layer_get_frame(window_layer);

    GRect menu_bounds = GRect(bounds.origin.x,
                              bounds.origin.y + STATUS_BAR_LAYER_HEIGHT,
                              bounds.size.w,
                              bounds.size.h - STATUS_BAR_LAYER_HEIGHT);
    menu->layer = menu_layer_create(menu_bounds);
    menu->load_layer = bitmap_layer_create(menu_bounds);

    menu_layer_set_callbacks(
        menu->layer, menu,
        (MenuLayerCallbacks){
            .get_num_sections = get_num_sections_callback,
            .get_num_rows = get_num_rows_callback,
            .get_header_height = get_header_height_callback,
            .draw_header = draw_header_callback,
            .draw_row = draw_row_callback,
            .select_click = menu->callbacks.select_click,
            .selection_will_change = selection_will_change_callback,
        });

    menu->load_image = gbitmap_create_with_resource(menu->load_image_resource_id);
    bitmap_layer_set_background_color(menu->load_layer, GColorBlack);
    bitmap_layer_set_bitmap(menu->load_layer, menu->load_image);

    layer_add_child(window_layer, menu_layer_get_layer(menu->layer));
    layer_add_child(window_layer, bitmap_layer_get_layer(menu->load_layer));

    int PROGRESS_LAYER_WINDOW_WIDTH = 80;
    int PROGRESS_LAYER_WINDOW_HEIGHT = 6;

    GRect progress_bounds = GRect((menu_bounds.size.w - PROGRESS_LAYER_WINDOW_WIDTH) / 2,
                                  155,
                                  PROGRESS_LAYER_WINDOW_WIDTH,
                                  PROGRESS_LAYER_WINDOW_HEIGHT);

    menu->progress_layer = progress_layer_create(progress_bounds);
    progress_layer_set_progress(menu->progress_layer, 0);
    progress_layer_set_corner_radius(menu->progress_layer, 2);
    progress_layer_set_foreground_color(menu->progress_layer, GColorLightGray);
    progress_layer_set_background_color(menu->progress_layer, GColorWhite);
    layer_add_child(window_layer, menu->progress_layer);
}

void window_appear(Window *window) {
    if (status_bar == NULL) {
        status_bar = status_bar_layer_create();
    }
    layer_add_child(window_get_root_layer(window), status_bar_layer_get_layer(status_bar));
}

Menu *menu_create(uint32_t load_image_resource_id, MenuCallbacks callbacks) {
    Menu *menu = malloc(sizeof(Menu));
    menu->window = window_create();
    menu->load_image_resource_id = load_image_resource_id;
    menu->callbacks = callbacks;
    menu->size = 0;
    menu->title = "";

    window_set_user_data(menu->window, menu);

    window_set_window_handlers(menu->window,
                               (WindowHandlers){
                                   .load = window_load,
                                   .unload = window_unload,
                                   .appear = window_appear,
                               });

    window_stack_push(menu->window, true);

    if (menu->menu == NULL) {
        menu_init_text_scroll(menu);
    }

    return menu;
}

void menu_increment_loading_progress(Menu *menu, int16_t progress) {
    progress_layer_increment_progress(menu->progress_layer, progress);
}
