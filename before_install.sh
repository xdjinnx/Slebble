if [ ! -d "pebble-dev/pebble-sdk-4.0-linux64" ]; then
  echo "No pebble-dev/pebble-sdk-4.0-linux64 found"
  wget https://s3.amazonaws.com/assets.getpebble.com/pebble-tool/pebble-sdk-4.0-linux64.tar.bz2 -O PebbleSDK.tar.bz2
  mkdir pebble-dev
  tar -xvjf PebbleSDK.tar.bz2 -C pebble-dev
fi

if [ ! -d "cmocka-1.0.1/build" ]; then
  echo "No cmocka-1.0.1/build found"
  wget --no-check-certificate https://cmocka.org/files/1.0/cmocka-1.0.1.tar.xz
  tar -xvf cmocka-1.0.1.tar.xz
  mkdir cmocka-1.0.1/build
  cmake -DCMAKE_INSTALL_PREFIX=/home/travis/build/xdjinnx/Slebble/cmocka -DCMAKE_BUILD_TYPE=Debug -Bcmocka-1.0.1/build -Hcmocka-1.0.1
fi
