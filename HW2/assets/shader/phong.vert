#version 330 core
layout(location = 0) in vec3 Position_in;
layout(location = 1) in vec3 Normal_in;
layout(location = 2) in vec2 TextureCoordinate_in;

out vec2 TextureCoordinate;
out vec3 rawPosition;
out vec3 Normalize;

out float ambientStrength;
out float diffuseStrength;
out float specularStrength; 

out vec4 lightPos; 
out vec3 lightColor;
out vec4 viewPos; 
out vec4 fragPosition;
out vec4 lightpoint;

out float outercutoff;
out float innercutoff;

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

layout (std140) uniform light {
  // Projection * View matrix
  mat4 lightSpaceMatrix;
  // Position or direction of the light
  vec4 lightVector;
  // inner cutoff, outer cutoff, isSpotlight, isDirectionalLight
  vec4 coefficients;
};

void main() {
  TextureCoordinate = TextureCoordinate_in;
  rawPosition = mat3(modelMatrix) * Position_in;
  Normalize = normalize(vec3(normalMatrix * vec4(Normal_in,1.0)));

  lightpoint = lightVector;

  fragPosition = modelMatrix * vec4(Position_in,1.0);
  // Ambient intensity
  float ambient = 0.1;
  float ks = 0.75;
  float kd = 0.75;
  ambientStrength = ambient;
  diffuseStrength = kd;
  specularStrength = ks;
  lightPos = lightVector;
  lightColor = vec3(1.0f,1.0f,1.0f);
  viewPos = viewPosition;
  outercutoff = coefficients.y;
  innercutoff = coefficients.x;



  // TODO: vertex shader / fragment shader
  // Hint:
  //       1. how to write a vertex shader:
  //          a. The output is gl_Position and anything you want to pass to the fragment shader. (Apply matrix multiplication yourself)
  //       2. how to write a fragment shader:
  //          a. The output is FragColor (any var is OK)
  //       3. colors
  //          a. For point light & directional light, lighting = ambient + attenuation * shadow * (diffuse + specular)
  //          b. If you want to implement multiple light sources, you may want to use lighting = shadow * attenuation * (ambient + (diffuse + specular))
  //       4. attenuation
  //          a. spotlight & pointlight: see spec
  //          b. directional light = no
  //          c. Use formula from slides 'shading.ppt' page 20
  //       5. spotlight cutoff: inner and outer from coefficients.x and coefficients.y
  //       6. diffuse = kd * max(normal vector dot light direction, 0.0)
  //       7. specular = ks * pow(max(normal vector dot halfway direction), 0.0), 8.0);
  //       8. notice the difference of light direction & distance between directional light & point light
  //       9. we've set ambient & color for you
  // Example without lighting :)
  gl_Position = viewProjectionMatrix * modelMatrix * vec4(Position_in, 1.0);
}
