#include "menu.h"

uint16_t menu_get_num_sections_callback(MenuLayer *menu_layer, void *data) {
    Menu* menu = data;
    if(menu->nearby)
        return 2;
    else
        return 1;
}

uint16_t menu_get_num_rows_callback(MenuLayer *menu_layer, uint16_t section_index, void *data) {
    Menu *menu = data;
    if (menu->nearby) {
        if(section_index == 0)
            return 1;
        else
            return menu->size;
    } else
        return menu->size;
}

int16_t menu_get_header_height_callback(MenuLayer *menu_layer, uint16_t section_index, void *data) {
    // This is a define provided in pebble.h that you may use for the default height
    return MENU_CELL_BASIC_HEADER_HEIGHT;
}

void menu_draw_header_callback(GContext* ctx, const Layer *cell_layer, uint16_t section_index, void *data) {
    Menu* menu = data;
    if(menu->nearby) {
        if (section_index == 0)
            menu_cell_basic_header_draw(ctx, cell_layer, "Stations");
        else
            menu_cell_basic_header_draw(ctx, cell_layer, menu->title);
    } else
        menu_cell_basic_header_draw(ctx, cell_layer, menu->title);
}

void menu_draw_row_callback(GContext* ctx, const Layer *cell_layer, MenuIndex *cell_index, void *data) {
    Menu* menu = data;
    if(menu->nearby) {
        if(cell_index->section == 0)
            menu_cell_basic_draw(ctx, cell_layer, "Nearby Station", "", NULL);
        else
            menu_cell_basic_draw(ctx, cell_layer, menu->row_title[cell_index->row], menu->row_subtitle[cell_index->row], NULL);
    } else
        menu_cell_basic_draw(ctx, cell_layer, menu->row_title[cell_index->row], menu->row_subtitle[cell_index->row], NULL);
}

void window_load(Window *window) {
    Menu* menu = window_get_user_data(window);

    Layer *window_layer = window_get_root_layer(window);
    GRect bounds = layer_get_frame(window_layer);

    menu->layer = menu_layer_create(bounds);

    menu_layer_set_callbacks(menu->layer, menu, (MenuLayerCallbacks){
            .get_num_sections = menu_get_num_sections_callback,
            .get_num_rows = menu_get_num_rows_callback,
            .get_header_height = menu_get_header_height_callback,
            .draw_header = menu_draw_header_callback,
            .draw_row = menu_draw_row_callback,
            .select_click = menu->callbacks.select_click,
    });

    menu->load_image = gbitmap_create_with_resource(menu->load_image_resource_id);
    menu->load_layer = bitmap_layer_create(bounds);
    bitmap_layer_set_background_color(menu->load_layer, GColorWhite);
    bitmap_layer_set_bitmap(menu->load_layer, menu->load_image);

    layer_add_child(window_layer, menu_layer_get_layer(menu->layer));
    layer_add_child(window_layer, bitmap_layer_get_layer(menu->load_layer));

}

void window_unload(Window *window) {
    Menu* menu = window_get_user_data(window);

    Menu *ret = menu->menu;
    menu->callbacks.remove_callback(ret);

    window_stack_remove(window, true);
    window_destroy(window);
    menu_layer_destroy(menu->layer);
    bitmap_layer_destroy(menu->load_layer);
    gbitmap_destroy(menu->load_image);

    if(menu->size != 0) {
        for(int i = 0; i < menu->size; i++) {
            free(menu->row_title[i]);
            free(menu->row_subtitle[i]);
            free(menu->data_char[i]);
        }
        free(menu->row_title);
        free(menu->row_subtitle);
        free(menu->title);
        free(menu->data_int);
        free(menu->data_char);
    }

    free(menu);
}

void menu_update(Menu *menu, int size, char *title, int index, char *row_title, char *row_subtitle, int data_int, char *data_char) {

    if(menu->size == 0) {
        menu->title = malloc(sizeof(char)*32);
        menu->row_title = malloc(sizeof(char*)*size);
        menu->row_subtitle = malloc(sizeof(char*)*size);
        menu->data_char = malloc(sizeof(char*)*size);
        for(int i = 0; i < size; i++) {
            menu->row_title[i] = malloc(sizeof(char)*32);
            menu->row_subtitle[i] = malloc(sizeof(char)*32);
            menu->data_char[i] = malloc(sizeof(char)*32);
        }
        menu->data_int = malloc(sizeof(int)*size);
    }

    menu->size = size;
    memcpy(menu->title, title, 32);
    memcpy(menu->row_title[index], row_title, 32);
    memcpy(menu->row_subtitle[index], row_subtitle, 32);
    
    if(data_char != NULL)
        memcpy(menu->data_char[index], data_char, 32);

    int *temp = menu->data_int;
    temp[index] = data_int;
}

void menu_hide_load_image(Menu *menu) {
    menu_layer_reload_data(menu->layer);
    layer_set_hidden(bitmap_layer_get_layer(menu->load_layer), true);
    menu_layer_set_click_config_onto_window(menu->layer, menu->window);
}

Menu* menu_create(uint32_t load_image_resource_id, MenuCallbacks callbacks) {
    Menu* menu = malloc(sizeof(Menu));
    menu->window = window_create();
    menu->load_image_resource_id = load_image_resource_id;
    menu->callbacks = callbacks;
    menu->size = 0;
    menu->nearby = false;

    window_set_user_data(menu->window, menu);

    window_set_window_handlers(menu->window, (WindowHandlers) {
            .load = window_load,
            .unload = window_unload,
    });

    window_stack_push(menu->window, true);

    return menu;
}