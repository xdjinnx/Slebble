#include "departure.h"
#include "pebble.h"

Departure *departure_create() {
    return calloc(1, sizeof(Departure));
}

void departure_destroy(Departure *departure) {
    free(departure);
}