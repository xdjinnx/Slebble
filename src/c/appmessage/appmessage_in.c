#include "appmessage_in.h"

#include "../menu/menu.h"
#include "../row_type/departure.h"
#include "../row_type/error.h"
#include "../row_type/station.h"
#include "../storage/storage.h"
#include "appmessage_out.h"

enum AppMessageEnum {
    PACKAGE = 0,
    TYPE = 1,
    MESSAGES_LEFT = 2
};

enum RowTypeEnum {
    STATION = 0,
    DEPARTURE = 1,
    ERROR = 2
};

Queue *queue;
char *section_title = "Favorites";

void appmessage_set_click_data(char *data) {
    section_title = data;
}

void in_dropped_handler(AppMessageResult reason, void *context) {
    APP_LOG(APP_LOG_LEVEL_WARNING, "DROPPED PACKAGE");
}

void in_received_handler(DictionaryIterator *iter, void *context) {
    Menu **menu = context;

    int package = dict_find(iter, PACKAGE)->value->int8;
    int type = dict_find(iter, TYPE)->value->int8;
    uint16_t messages_left = dict_find(iter, MESSAGES_LEFT)->value->uint8;

    if (package >= appmessage_package_key_value()) {
        void *data = NULL;

        if (type == STATION) {
            data = station_create(iter);
        }

        if (type == DEPARTURE) {
            data = departure_create(iter);
        }

        if (type == ERROR) {
            data = error_create(iter);
        }

        queue_queue(queue, data);

        uint16_t progress_amount = 100 / (queue_length(queue) + messages_left);
        menu_increment_loading_progress(*menu, progress_amount);

        if (messages_left == 0) {
            menu_add_rows(*menu, section_title, queue);
            storage_save(*menu);
        }
    }
}

void appmessage_register_app_message() {
    queue = queue_create();

    app_message_register_inbox_received(in_received_handler);
    app_message_register_inbox_dropped(in_dropped_handler);

    app_message_open(512, 512);
    app_comm_set_sniff_interval(SNIFF_INTERVAL_REDUCED);
}

Queue *appmessage_queue_pointer() {
    return queue;
}