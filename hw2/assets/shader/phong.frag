#version 330 core
layout(location = 0) out vec4 FragColor;

in vec2 TextureCoordinate;
in vec3 rawPosition;
in vec3 Normalize;

in float ambientStrength;
in float diffuseStrength;
in float specularStrength; 

in vec4 lightpoint;
in vec4 lightPos; 
in vec3 lightColor;
in vec4 viewPos; 
in vec4 fragPosition;

in float outercutoff;
in float innercutoff;

uniform sampler2D diffuseTexture;
uniform samplerCube diffuseCubeTexture;
uniform int currentlight;

// precomputed shadow
// Hint: You may want to uncomment this to use shader map texture.
// uniform sampler2DShadow shadowMap;
uniform int isCube;

void main() {
  vec4 diffuseTextureColor = texture(diffuseTexture, TextureCoordinate);
  vec4 diffuseCubeTextureColor = texture(diffuseCubeTexture, rawPosition);
  vec3 color = isCube == 1 ? diffuseCubeTextureColor.rgb : diffuseTextureColor.rgb;

  float distanceToLight = length(lightPos - fragPosition);
  float att_point = 1 / (1 + distanceToLight * 0.027 + pow(distanceToLight,2) * 0.0028);

  //ambient
  vec3 ambient = ambientStrength * lightColor;

  //diffuse
  vec3 lightDir = normalize(vec3(lightPos - fragPosition));
  float diff = max(dot(Normalize, lightDir), 0.0);
  vec3 diffuse = diffuseStrength * diff * lightColor;

  //specular
  vec3 viewDir = normalize(vec3(viewPos - fragPosition));
  vec3 halfway = normalize(vec3(viewDir + lightDir));
  float spec = pow(max(dot(Normalize, halfway), 0.0), 8);
  vec3 specular = specularStrength * spec * lightColor;  
  vec3 light;

  //result
  if(currentlight == 0)
	 light = (ambient + 0.65 * (diffuse + specular)) * color;
  else if(currentlight == 1)
     light = (ambient + att_point * (diffuse + specular)) * color;
  else{
	 float theta = dot(normalize(lightpoint.xyz), -viewDir);
	 float epsilon = innercutoff - outercutoff;
	 float intensity = clamp((theta - outercutoff) / epsilon, 0.0, 1.0);

	 vec3 halfway = normalize(viewDir);
	 vec3 diff = diffuseStrength * max(dot(Normalize,viewDir),0.0) * lightColor;
     vec3 spec = specularStrength * pow(max(dot(Normalize,halfway),0.0),8.0) * lightColor;

	 float distanceToLight = length(viewPos - fragPosition);
	 float att_spot = 1 / (1 + distanceToLight * 0.014 + pow(distanceToLight,2) * 0.007);

	 light = (ambient + att_spot * intensity * (diff + spec)) * color;
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
  FragColor = vec4(light, 1.0);
}
