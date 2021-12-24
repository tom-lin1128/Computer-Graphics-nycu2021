#version 330 core
layout(location = 0) out vec4 normal;
layout(location = 1) out float height;

uniform float offset;

void main() {
  const float delta = 0.01;
  // TODO: Generate the normal map.
  //   1. Get the position of the fragment. (screen space)
  //   2. Sample 4 points from combination of x +- delta, y +- delta
  //   3. Form at least 2 triangles from those points. Calculate their surface normal
  //   4. Average the surface normal, then tranform the normal [-1, 1] to RGB [0, 1]
  //   5. (Bonus) Output the H(x, y)
  // Note:
  //   1. Height at (x, y) = H(x, y) = sin(offset - 0.1 * y)
  //   2. A simple tranform from [-1, 1] to [0, 1] is f(x) = x * 0.5 + 0.5

  vec4 fragPos  = gl_FragCoord;
  vec3 p1 = vec3(fragPos.x+delta, fragPos.y, fragPos.z);
  vec3 p2 = vec3(fragPos.x-delta, fragPos.y, fragPos.z);
  vec3 p3 = vec3(fragPos.x, fragPos.y+delta, fragPos.z);
  vec3 p4 = vec3(fragPos.x, fragPos.y-delta, fragPos.z);

  vec3 U1 = p2 - p3;
  vec3 V1 = p1 - p3;

  vec3 U2 = p3 - p4;
  vec3 V2 = p2 - p4;

  vec3 U3 = p3 - p1;
  vec3 V3 = p4 - p1;

  vec3 U4 = p4 - p2;
  vec3 V4 = p3 - p2;


  vec3 N1 = cross(V1,U1);
  vec3 N2 = cross(V2,U2);
  vec3 N3 = cross(V3,U3);
  vec3 N4 = cross(V4,U4);

  vec3 avgNormal = normalize((N1 + N2 + N3 + N4) / 4) * 0.5 + 0.5;
  height = sin(offset - 0.1 * fragPos.y);
  normal = vec4(avgNormal*height, 1.0);
  
}
