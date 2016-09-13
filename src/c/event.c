#include "event.h"

#include "menu/menu.h"
#include "row_type/departure.h"
#include "row_type/station.h"
#include "row_type/error.h"

enum AppMessageEnum {
    PACKAGE = 0,
    TYPE = 1,
    LAST = 2
};

enum TypeEnum {
    STATION = 0,
    DEPARTURE = 1,
    ERROR = 2
};

Queue *queue;
int expected_package_key = 0;
char *event_data_char = "Favorites";
view_func add_view;
void **view_ptr;

void event_set_view_func(void *view, view_func func) {
    view_ptr = view;
    add_view = func;
    queue = queue_create();
}

void event_set_click_data(char *data) {
    event_data_char = data;
}

void in_dropped_handler(AppMessageResult reason, void *context) {
    APP_LOG(APP_LOG_LEVEL_WARNING, "DROPPED PACKAGE");
}

void in_received_handler(DictionaryIterator *iter, void *context) {
    // APP_LOG(APP_LOG_LEVEL_INFO, "Appmessage recived");

    int package = dict_find(iter, PACKAGE)->value->int8;
    int type = dict_find(iter, TYPE)->value->int8;
    int last = dict_find(iter, LAST)->value->int8;

    if (package >= expected_package_key) {
        void *data;
        converter converter;

        if (type == STATION) {
            data = station_create(iter);
            converter = station_convert;
        } else if (type == DEPARTURE) {
            data = departure_create(iter);
            converter = departure_convert;
        } else {
            data = error_create(iter);
            converter = error_convert;
        }

        queue_queue(queue, data);

        if (last) {
            add_view(*view_ptr, event_data_char, queue, converter);
        }
    }
}

void event_register_app_message() {
    app_message_register_inbox_received(in_received_handler);
    app_message_register_inbox_dropped(in_dropped_handler);

    app_message_open(512, 512);
    app_comm_set_sniff_interval(SNIFF_INTERVAL_REDUCED);
}

void appmessage(int index, int step, int local_expected_package_key) {
    while (!queue_empty(queue)) {
        Row *row = queue_pop(queue);
        free(row);
    }

    Tuplet value1 = TupletInteger(1, index);
    Tuplet value2 = TupletInteger(2, step);
    Tuplet value3 = TupletInteger(3, local_expected_package_key);

    DictionaryIterator *iter;
    app_message_outbox_begin(&iter);

    if (iter == NULL)
        return;

    dict_write_tuplet(iter, &value1);
    dict_write_tuplet(iter, &value2);
    dict_write_tuplet(iter, &value3);
    dict_write_end(iter);

    app_message_outbox_send();
}

void update_appmessage() {
    appmessage(0, 2, expected_package_key);
}

void send_appmessage(int index, int step) {
    appmessage(index, step, ++expected_package_key);
}
