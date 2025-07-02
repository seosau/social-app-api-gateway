#!/bin/bash

PROTO_DIR="./proto"
OUT_DIR="./src/generated"
TS_PROTO_PLUGIN="./node_modules/.bin/protoc-gen-ts_proto"

# Ensure output directory exists
mkdir -p "$OUT_DIR"

# install needed package
# npm install ts-proto --save-dev
chmod +x ./node_modules/.bin/protoc-gen-ts_proto

# Loop through each .proto file
find "$PROTO_DIR" -name "*.proto" | while read -r proto_file; do
  # Extract just the filename
  file_name=$(basename "$proto_file")

  # Choose options based on file name
  if [[ "$file_name" == "notification_enum.proto" ]]; then
    # No nestJs for enum-only proto
    OPTIONS="outputServices=grpc-js,enumAsLiteral=false"
  else
    # Default for others
    OPTIONS="nestJs=true,outputServices=grpc-js"
  fi

  echo "Generating for $proto_file with options: $OPTIONS"
  
  npx protoc \
    --plugin=protoc-gen-ts_proto=$TS_PROTO_PLUGIN \
    --ts_proto_out=$OUT_DIR \
    --ts_proto_opt=$OPTIONS \
    --proto_path=$PROTO_DIR \
    --experimental_allow_proto3_optional \
    "$proto_file"
done

echo "✅ Proto generation complete!"
