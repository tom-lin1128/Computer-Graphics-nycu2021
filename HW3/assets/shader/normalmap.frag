#version 330 core
layout(location = 0) out vec4 FragColor;

in VS_OUT {
  vec3 position;
  vec3 lightDirection;
  vec2 textureCoordinate;
  flat vec3 viewPosition;
} fs_in;

uniform bool useParallaxMapping;
// RGB contains the color
uniform sampler2D diffuseTexture;
// RGB contains the normal
uniform sampler2D normalTexture;
// R contains the height
// TODO (Bonus-Parallax): You may need these if you want to implement parallax mapping.
uniform sampler2D heightTexture;
float depthScale = 0.01;

vec2 parallaxMapping(vec2 textureCoordinate, vec3 viewDirection)
{
  // number of depth layers
  const float minLayers = 8;
  const float maxLayers = 32;

  float numLayers = mix(maxLayers, minLayers, abs(dot(vec3(0.0, 0.0, 1.0), viewDirection)));  

  float layerDepth = 1.0 / numLayers;

  float currentLayerDepth = 0.0;

  vec2 P = viewDirection.xy / viewDirection.z * depthScale; 
  vec2 deltaTexCoords = P / numLayers;
  

  vec2  currentTexCoords     = textureCoordinate;
  float currentDepthMapValue = 1 - texture(heightTexture, currentTexCoords).r;
      
  while(currentLayerDepth < currentDepthMapValue)
  {

      currentTexCoords -= deltaTexCoords;
      currentDepthMapValue = 1 - texture(heightTexture, currentTexCoords).r;  
      currentLayerDepth += layerDepth;  
  }
    
  vec2 prevTexCoords = currentTexCoords + deltaTexCoords;

  float afterDepth  = currentDepthMapValue - currentLayerDepth;
  float beforeDepth = (1 - texture(heightTexture, prevTexCoords).r) - currentLayerDepth + layerDepth;
 
  float weight = afterDepth / (afterDepth - beforeDepth);
  textureCoordinate = prevTexCoords * weight + currentTexCoords * (1.0 - weight);

  // TODO (Bonus-Parallax): Implement parallax occlusion mapping.
  // Hint: You need to return a new texture coordinate.
  // Note: The texture is 'height' texture, you may need a 'depth' texture, which is 1 - height.
  return textureCoordinate;
}

void main() {
  vec3 viewDirectionection = normalize(fs_in.viewPosition - fs_in.position);
  //vec3 lightDir = normalize(fs_in.lightDirection - fs_in.position);
  vec2 textureCoordinate = useParallaxMapping ? parallaxMapping(fs_in.textureCoordinate, viewDirectionection) : fs_in.textureCoordinate;
  if(useParallaxMapping && (textureCoordinate.x > 1.0 || textureCoordinate.y > 1.0 || textureCoordinate.x < 0.0 || textureCoordinate.y < 0.0))
    discard;
  // Query diffuse texture
  vec3 diffuseColor = texture(diffuseTexture, textureCoordinate).rgb;
  vec3 Normal_line = texture(normalTexture, textureCoordinate).rgb;
  Normal_line = normalize(Normal_line * 2.0 - 1.0);

  // Ambient intensity
  float ambient = 0.1;
  float diffuse = 0.0;
  float specular = 0.0;
  diffuse = 0.75 * max(dot(Normal_line, fs_in.lightDirection),0.0);

  vec3 halfway = normalize(viewDirectionection + fs_in.lightDirection);
  specular = 0.75 * pow(max(dot(Normal_line, halfway), 0.0), 8);


  // TODO: Blinn-Phong shading
  //   1. Query normalTexture using to find this fragment's normal
  //   2. Convert the value from RGB [0, 1] to normal [-1, 1], this will be inverse of what you do in calculatenormal.frag's output.
  //   3. Remember to NORMALIZE it again.
  //   4. Use Blinn-Phong shading here with parameters ks = kd = 0.75
  float lighting = ambient + diffuse + specular;
  FragColor = vec4(lighting * diffuseColor, 1.0);
}
