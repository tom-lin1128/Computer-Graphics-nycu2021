#version 330 core
layout(location = 0) in vec3 position_in;
layout(location = 1) in vec3 normal_in;
layout(location = 2) in vec2 textureCoordinate_in;
layout(location = 3) in vec3 tangent_in;
layout(location = 4) in vec3 bitangent_in;

out VS_OUT {
  vec3 position;
  vec3 lightDirection;
  vec2 textureCoordinate;
  flat vec3 viewPosition;
} vs_out;

uniform bool useDisplacementMapping;
// TODO (Bonus-Displacement): You may need these if you want to implement displacement mapping.
uniform sampler2D heightTexture;
float depthScale = 0.01;

layout (std140) uniform model {
  // Model matrix
  mat4 modelMatrix;
  // inverse(transpose(model)), precalculate using CPU for efficiency
  mat4 normalMatrix;
};

layout (std140) uniform camera {
  // Projection * View matrix
  mat4 viewProjectionMatrix;
  // Position of the camera
  vec4 viewPosition;
};

void main() {
  // Direction of light, hard coded here for convinience.
  const vec3 lightDirection = normalize(vec3(-11.1, -24.9, 14.8));
  vs_out.textureCoordinate = textureCoordinate_in;

  vec4 Normal = normalMatrix * vec4(normal_in,1.0);

  vec3 T = normalize(vec3(modelMatrix * vec4(tangent_in,   0.0)));
  vec3 B = normalize(vec3(modelMatrix * vec4(bitangent_in, 0.0)));
  vec3 N = normalize(vec3(modelMatrix * Normal));
  /*vec3 T = normalize(tangent_in);
  vec3 B = normalize(bitangent_in);
  vec3 N = normalize(vec3(Normal));*/
  mat3 TBN_in = transpose(mat3(T, B, N)); 

  vs_out.position = TBN_in * vec3(modelMatrix*vec4(position_in,1.0));
  vs_out.lightDirection = TBN_in * vec3(modelMatrix * vec4(lightDirection,1.0));
  vs_out.viewPosition = TBN_in * vec3(modelMatrix * viewPosition);


  // TODO:
  //   1. Calculate the inverse of tangent space transform matrix (TBN matrix)
  //   2. Transform light direction, viewPosition, and position to the tangent space.
  //   3. (Bonus-Displacement) Query height from heightTexture.

  vec3 displacementVector = vec3(0);
  if (useDisplacementMapping) {
    displacementVector = depthScale * normal_in * texture(heightTexture, textureCoordinate_in).r;
    // TODO (Bonus-Displacement): Set displacementVector, you should scale the height query from heightTexture by depthScale.
  }
  gl_Position = viewProjectionMatrix * (modelMatrix * vec4(position_in + displacementVector,1.0));
}
