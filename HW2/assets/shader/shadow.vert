#version 330 core
// x, y, z
layout(location = 0) in vec3 Position_in;
// x, y, z
layout(location = 1) in vec3 Normal_in;
// u, v
layout(location = 2) in vec2 TextureCoordinate_in;
// Hint: Gouraud shading calculates per vertex color, interpolate in fs
// You may want to add some out here
out vec3 rawPosition;
out vec2 TextureCoordinate;
out vec3 lighting;



// Uniform blocks
// https://www.khronos.org/opengl/wiki/Interface_Block_(GLSL)
uniform int currentlight;

layout (std140) uniform model {
  // Model matrix
  mat4 modelMatrix;
  // mat4(inverse(transpose(mat3(modelMatrix)))), precalculate using CPU for efficiency
  mat4 normalMatrix;

};

layout (std140) uniform camera {
  // Camera's projection * view matrix
  mat4 viewProjectionMatrix;
  // Position of the camera
  vec4 viewPosition;
};

layout (std140) uniform light {
  // Light's projection * view matrix
  // Hint: If you want to implement shadow, you may use this.
  mat4 lightSpaceMatrix;
  // Position or direction of the light
  vec4 lightVector;
  // inner cutoff, outer cutoff, isSpotlight, isDirectionalLight
  vec4 coefficients;

};

// precomputed shadow
// Hint: You may want to uncomment this to use shader map texture.
uniform sampler2D shadowMap;

float ShadowCalculation(vec4 fragPosLightSpace)
{
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    projCoords = projCoords * 0.5 + 0.5;
    float closestDepth = texture(shadowMap, projCoords.xy).r; 
    float currentDepth = projCoords.z;
    float shadow = currentDepth > closestDepth  ? 1.0 : 0.0;
    return shadow;
}

void main() { 
  vec3 light_color = vec3(1.0f,1.0f,1.0f);
  TextureCoordinate = TextureCoordinate_in;
  rawPosition = mat3(modelMatrix) * Position_in;

  vec4 fragPosition = modelMatrix * vec4(Position_in,1.0);

  vec4 FragPosLightSpace = lightSpaceMatrix * fragPosition ;
  float depthValue = texture(shadowMap, FragPosLightSpace.xy).z;

  vec3 Normalize = normalize(vec3(normalMatrix * vec4(Normal_in,1.0)));
  vec3 lightDir = normalize(vec3(lightVector- fragPosition));
  vec3 viewDir = normalize(vec3(viewPosition - fragPosition));

  vec3 halfway = normalize(viewDir + lightDir);
  float distanceToLight = length(lightVector - fragPosition);

  float att_point = 1 / (1 + distanceToLight * 0.027 + pow(distanceToLight,2) * 0.0028);



  // Ambient intensity
  float ambient = 0.1;
  float ks = 0.75;
  float kd = 0.75;

  
  vec3 Iamb = ambient * light_color;
  vec3 diff = kd * max(dot(Normalize,lightDir),0.0) * light_color;
  vec3 spec = ks * pow(max(dot(Normalize,halfway),0.0),8.0) * light_color;

  //float shadow = ShadowCalculation(FragPosLightSpace);
  float shadow = 1.0;
  if(depthValue > FragPosLightSpace.z){
	shadow = 0.5;
  }

  if(currentlight == 0) //direct
	 lighting = Iamb + 0.65 * (shadow) * (diff + spec);
  else if(currentlight == 1) //point
	 lighting = Iamb + att_point  * (diff + spec);
  else { //spotlight
    float theta = dot(normalize(lightVector.xyz), -viewDir);
	float epsilon = coefficients.x - coefficients.y;
	float intensity = clamp((theta - coefficients.y) / epsilon, 0.0, 1.0);

	vec3 halfway = normalize(viewDir);
	vec3 diff = kd * max(dot(Normalize,viewDir),0.0) * light_color;
    vec3 spec = ks * pow(max(dot(Normalize,halfway),0.0),8.0) * light_color;

	float distanceToLight = length((viewPosition - fragPosition) - fragPosition);
	float att_spot = 1 / (1 + distanceToLight * 0.014 + pow(distanceToLight,2) * 0.007);

	lighting = Iamb +   att_spot * intensity * (diff + spec);
  }




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
