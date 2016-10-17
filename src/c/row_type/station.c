#include "station.h"

#include "../menu/row.h"
#include "pebble.h"

enum StationEnum {
    // 0, 1, 2 allocated for AppMessageEnum
    TITLE = 3
};

typedef struct StationData {
    char title[64];
} StationData;

void station_update(Station *station) {
    StationData *station_data = station->data;

    memcpy(station->title, station_data->title, 64);
}

Station *station_create_blank() {
    StationData *station_data = calloc(1, sizeof(StationData));

    Station *station = row_create(station_data);
    station_update(station);

    return station;
}

Station *station_create(DictionaryIterator *iter) {
    StationData *station_data = calloc(1, sizeof(StationData));

    Tuple *title_tuple = dict_find(iter, TITLE);
    memcpy(station_data->title, title_tuple->value->cstring, title_tuple->length);

    Station *station = row_create(station_data);
    station_update(station);

    return station;
}

void station_destroy(Station *station) {
    free(station);
}
