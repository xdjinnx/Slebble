#include "storage.h"

#include "../row_type/station.h"
#include "../queue.h"

bool storage_load(Menu *menu) {
    if (menu->id != 0 || !persist_exists(1)) {
        return false;
    }

    // Position 0 in the persist saves the size of the menu. This is deprecated.
    Queue *queue = queue_create();

    for (int i = 1; persist_exists(i); i++) {
        Station *station = station_create_blank();
        persist_read_string(i, station->title, 64);
        queue_queue(queue, station);
    }

    menu_add_data(menu, "Favorites", queue, &station_convert);

    return true;
}

void storage_save(Menu *menu) {
    if (menu->id != 0) {
        return;
    }

    //persist_write_int(0, menu->size);
    for (int i = 0; i < menu->size; i++) {
        Station *station = menu->data[i];
        persist_write_string(i + 1, station->title);
    }
}