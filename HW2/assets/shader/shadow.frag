#version 330 core
layout(location = 0) out vec4 FragColor;
// Data from vertex shader
// Hint: Gouraud shading calculates per vertex color, interpolate in fs
// You may want to add some in here if you add some outs in vs
in vec3 rawPosition;
in vec2 TextureCoordinate;
in vec3 lighting;

// Texture of object
uniform sampler2D diffuseTexture;
uniform samplerCube diffuseCubeTexture;
uniform int isCube;

void main() {
  vec4 diffuseTextureColor = texture(diffuseTexture, TextureCoordinate);
  vec4 diffuseCubeTextureColor = texture(diffuseCubeTexture, rawPosition);
  vec3 color = isCube == 1 ? diffuseCubeTextureColor.rgb : diffuseTextureColor.rgb;
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
  //       9. we've set color for you

  // No lighting now
  vec3 resultColor = lighting	 * color ;
  FragColor = vec4(resultColor, 1.0);
}
