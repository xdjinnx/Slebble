#include "appmessage_out.h"

#include "../menu/menu.h"
#include "appmessage_in.h"

enum RequestTypeEnum {
    STATION = 0,
    NEARBYSTATION = 1,
    UPDATE = 2,
    CLEAR_NEARBYSTATION = 3
};

int expected_package_key = 0;

void appmessage(int index, int step, int local_expected_package_key) {
    Queue *queue = appmessage_queue_pointer();
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

void appmessage_station(int index) {
    expected_package_key++;
    appmessage(index, STATION, expected_package_key);
}

void appmessage_nearby_station() {
    expected_package_key++;
    appmessage(0, NEARBYSTATION, expected_package_key);
}

void appmessage_clear_nearby_station() {
    appmessage(0, CLEAR_NEARBYSTATION, expected_package_key);
}

void appmessage_update() {
    appmessage(0, UPDATE, expected_package_key);
}

int appmessage_package_key_value() {
    return expected_package_key;
}
