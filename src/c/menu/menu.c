#include "menu.h"

#include "text_scroll/text_scroll.h"

uint prev_index = 0;
StatusBarLayer *status_bar;

uint16_t menu_get_num_sections_callback(MenuLayer *menu_layer, void *data) {
    Menu *menu = data;
    if (menu->menu == NULL)
        return 2;
    else
        return 1;
}

uint16_t menu_get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *data) {
    Menu *menu = data;
    if (menu->menu == NULL && section_index == 0) {
        return 1;
    } else {
        return menu->size;
    }
}

int16_t menu_get_header_height_callback(MenuLayer *menu_layer, uint16_t section_index, void *data) {
    // This is a define provided in pebble.h that you may use for the default height
    return MENU_CELL_BASIC_HEADER_HEIGHT;
}

void menu_draw_header_callback(GContext *ctx, const Layer *cell_layer, uint16_t section_index, void *data) {
    Menu *menu = data;

    if (menu->menu == NULL && section_index == 0) {
        menu_cell_basic_header_draw(ctx, cell_layer, "Stations");
    } else {
        menu_cell_basic_header_draw(ctx, cell_layer, menu->title);
    }
}

void menu_draw_row_callback(GContext *ctx, const Layer *cell_layer, MenuIndex *cell_index, void *data) {
    Menu *menu = data;
    MenuIndex selected_item = menu_layer_get_selected_index(menu->layer);
    if (menu->menu == NULL && cell_index->section == 0)
        menu_cell_basic_draw(ctx, cell_layer, "Nearby Stations", "", NULL);
    else {
        Row *row = menu->converter(menu->data[cell_index->row]);
        char *title = row->title;
        char *subtitle = row->subtitle;

        if (selected_item.row == cell_index->row && menu->menu == NULL) {
            title = title + (text_scroll_value() * sizeof(char));
        }

        menu_cell_basic_draw(ctx, cell_layer, title, subtitle, NULL);
        row_destroy(row);
    }
}

void selection_changed_callback(struct MenuLayer *menu_layer, MenuIndex new_index, MenuIndex old_index, void *data) {
    Menu *menu = data;
    if (new_index.row != prev_index) {
        prev_index = new_index.row;
        text_scroll_reset();
    }
    if (menu->menu == NULL && new_index.section == 0) {
        text_scroll_reset();
    }
}

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
            .get_num_sections = menu_get_num_sections_callback,
            .get_num_rows = menu_get_num_rows_callback,
            .get_header_height = menu_get_header_height_callback,
            .draw_header = menu_draw_header_callback,
            .draw_row = menu_draw_row_callback,
            .select_click = menu->callbacks.select_click,
            .selection_changed = selection_changed_callback,
        });

    menu->load_image = gbitmap_create_with_resource(menu->load_image_resource_id);
    bitmap_layer_set_background_color(menu->load_layer, GColorBlack);
    bitmap_layer_set_bitmap(menu->load_layer, menu->load_image);

    layer_add_child(window_layer, menu_layer_get_layer(menu->layer));
    layer_add_child(window_layer, bitmap_layer_get_layer(menu->load_layer));
}

void window_appear(Window *window) {
    if (status_bar == NULL) {
        status_bar = status_bar_layer_create();
    }
    layer_add_child(window_get_root_layer(window), status_bar_layer_get_layer(status_bar));
}

void free_data(Menu *menu) {
    if (menu->size == 0) {
        return;
    }

    for (int i = 0; i < menu->size; i++) {
        free(menu->data[i]);
    }
}

void window_unload(Window *window) {
    Menu *menu = window_get_user_data(window);
    if (menu->menu == NULL) {
        menu_deinit_text_scroll();
    }

    Menu *ret = menu->menu;

    if (ret != NULL) {
        prev_index = menu_layer_get_selected_index(ret->layer).row;
    }
    text_scroll_reset();

    menu->callbacks.remove_callback(ret);

    window_stack_remove(window, true);
    window_destroy(window);
    menu_layer_destroy(menu->layer);
    bitmap_layer_destroy(menu->load_layer);
    gbitmap_destroy(menu->load_image);

    free_data(menu);
    free(menu->data);

    if (ret == NULL) {
        status_bar_layer_destroy(status_bar);
    }

    free(menu);
}

void hide_load_image(Menu *menu, bool vibe) {
    if (layer_get_hidden(bitmap_layer_get_layer(menu->load_layer))) {
        return;
    }

    prev_index = 0;
    text_scroll_reset();
    menu_layer_reload_data(menu->layer);
    layer_set_hidden(bitmap_layer_get_layer(menu->load_layer), true);
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
