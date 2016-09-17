#include "menu.h"

int new_id = 0;
AppTimer *scroll_timer;
int text_scroll = -2;
uint prev_index = 0;
StatusBarLayer *status_bar;

uint16_t menu_get_num_sections_callback(MenuLayer *menu_layer, void *data) {
    Menu *menu = data;
    if (menu->id == 0)
        return 2;
    else
        return 1;
}

uint16_t menu_get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *data) {
    Menu *menu = data;
    if (menu->id == 0 && section_index == 0) {
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

    if (menu->id == 0 && section_index == 0) {
        menu_cell_basic_header_draw(ctx, cell_layer, "Stations");
    } else {
        menu_cell_basic_header_draw(ctx, cell_layer, menu->title);
    }
}

void menu_draw_row_callback(GContext *ctx, const Layer *cell_layer, MenuIndex *cell_index, void *data) {
    Menu *menu = data;
    MenuIndex selected_item = menu_layer_get_selected_index(menu->layer);
    if (menu->id == 0 && cell_index->section == 0)
        menu_cell_basic_draw(ctx, cell_layer, "Nearby Stations", "", NULL);
    else {
        Row *row = menu->converter(menu->data[cell_index->row]);
        char *title = row->title;
        char *subtitle = row->subtitle;

        if (selected_item.row == cell_index->row && text_scroll >= 0) {
            title = title + ((uint)text_scroll * sizeof(char));
        }

        menu_cell_basic_draw(ctx, cell_layer, title, subtitle, NULL);
        row_destroy(row);
    }
}

void selection_changed_callback(struct MenuLayer *menu_layer, MenuIndex new_index, MenuIndex old_index, void *data) {
    Menu *menu = data;
    if (new_index.row != prev_index) {
        prev_index = new_index.row;
        text_scroll = -2;
    }
    if (menu->id == 0 && new_index.section == 0) {
        text_scroll = -2;
    }
}

void text_scroll_handler(void *data) {
    Menu *menu = *((Menu **)data);
    MenuIndex selected_item = menu_layer_get_selected_index(menu->layer);

    Row *row = NULL;

    if (menu->size > 0) {
        row = menu->converter(menu->data[selected_item.row]);
    }

    if (row) {
        char current_char = *(row->title + ((uint)text_scroll * sizeof(char)));

        // Fixes åäö edge case
        if (current_char == 195) {
            text_scroll++;
        }
    }

    if (!(menu->id == 0 && selected_item.section == 0)) {
        text_scroll++;
    }

    if (row && text_scroll > ((int)strlen(row->title)) - 17) {
        text_scroll = -2;
    }

    menu_layer_reload_data(menu->layer);
    scroll_timer = app_timer_register(500, &text_scroll_handler, data);
    row_destroy(row);
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

void window_unload(Window *window) {
    Menu *menu = window_get_user_data(window);
    if (menu->id == 0)
        menu_deinit_text_scroll();

    Menu *ret = menu->menu;

    if (ret != NULL) {
        prev_index = menu_layer_get_selected_index(ret->layer).row;
    }
    text_scroll = -2;

    menu->callbacks.remove_callback(ret);

    window_stack_remove(window, true);
    window_destroy(window);
    menu_layer_destroy(menu->layer);
    bitmap_layer_destroy(menu->load_layer);
    gbitmap_destroy(menu->load_image);

    if (menu->size != 0) {
        for (int i = 0; i < menu->size; i++) {
            free(menu->data[i]);
        }

        free(menu->data);
    }

    if (ret == NULL)
        status_bar_layer_destroy(status_bar);

    free(menu);
}

void window_appear(Window *window) {
    if (status_bar == NULL) {
        status_bar = status_bar_layer_create();
    }
    layer_add_child(window_get_root_layer(window), status_bar_layer_get_layer(status_bar));
}

void hide_load_image(Menu *menu, bool vibe) {
    if (!layer_get_hidden(bitmap_layer_get_layer(menu->load_layer))) {
        prev_index = 0;
        text_scroll = -2;
        menu_layer_reload_data(menu->layer);
        layer_set_hidden(bitmap_layer_get_layer(menu->load_layer), true);
        menu_layer_set_click_config_onto_window(menu->layer, menu->window);

        if (vibe) {
            vibes_short_pulse();
        }
    }
}

// Should be able to send an array pointer.
void menu_add_data(void *menu_void, char *title, Queue *queue, converter converter) {
    if (menu_void == NULL) {
        return;
    }

    Menu *menu = (Menu *)menu_void;
    if (0 < menu->size && strcmp(menu->title, title) != 0) {
        return;
    }

    menu->title = title;
    menu->converter = converter;
    menu_allocation(menu, queue_length(queue));

    for (int i = 0; !queue_empty(queue); i++) {
        menu->data[i] = queue_pop(queue);
    }

    menu_layer_reload_data(menu->layer);
    hide_load_image(menu, true);
}

void menu_init_text_scroll(Menu **menu) {
    scroll_timer = app_timer_register(500, &text_scroll_handler, menu);
}
void menu_deinit_text_scroll() {
    app_timer_cancel(scroll_timer);
}

Menu *menu_create(uint32_t load_image_resource_id, MenuCallbacks callbacks) {
    Menu *menu = malloc(sizeof(Menu));
    menu->window = window_create();
    menu->load_image_resource_id = load_image_resource_id;
    menu->callbacks = callbacks;
    menu->size = 0;
    menu->id = new_id++;
    menu->title = "";

    window_set_user_data(menu->window, menu);

    window_set_window_handlers(menu->window,
                               (WindowHandlers){
                                   .load = window_load,
                                   .unload = window_unload,
                                   .appear = window_appear,
                               });

    window_stack_push(menu->window, true);

    return menu;
}
