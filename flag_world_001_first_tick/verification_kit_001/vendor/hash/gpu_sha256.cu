// Generic byte hashing substrate. No application fields, source-law names,
// world states, acceptance decisions, or expected digests are present.
// sha256.c/.h are retained byte-identical from the qualified native checker.
#include <cuda_runtime.h>
#include <stdint.h>
#include <fstream>
#include <iostream>
#include <vector>
#include <stdexcept>
#include <limits>
#define static static __device__
#define malcog_sha256 __device__ malcog_sha256
#include "sha256.c"
#undef malcog_sha256
#undef static
__global__ void hash_bytes(const uint8_t* data,uint32_t count,uint8_t* result){
 if(blockIdx.x==0&&threadIdx.x==0)malcog_sha256(data,count,result);
}
void ck(cudaError_t x){if(x!=cudaSuccess)throw std::runtime_error(cudaGetErrorString(x));}
int main(int argc,char**argv){try{
 if(argc!=3)throw std::runtime_error("input bytes output digest required");
 std::ifstream in(argv[1],std::ios::binary);if(!in)throw std::runtime_error("input custody");
 std::vector<uint8_t>b((std::istreambuf_iterator<char>(in)),{});
 if(b.size()>std::numeric_limits<uint32_t>::max())throw std::runtime_error("byte count bound");
 uint8_t *d,*r,result[32];ck(cudaMalloc(&d,b.empty()?1:b.size()));ck(cudaMalloc(&r,32));
 if(!b.empty())ck(cudaMemcpy(d,b.data(),b.size(),cudaMemcpyHostToDevice));
 hash_bytes<<<1,1>>>(d,static_cast<uint32_t>(b.size()),r);ck(cudaGetLastError());ck(cudaDeviceSynchronize());ck(cudaMemcpy(result,r,32,cudaMemcpyDeviceToHost));
 std::ofstream out(argv[2],std::ios::binary);out.write(reinterpret_cast<char*>(result),32);if(!out)throw std::runtime_error("output custody");
 cudaDeviceProp p{};ck(cudaGetDeviceProperties(&p,0));std::cout<<"gpu="<<p.name<<" input_bytes="<<b.size()<<" digest_bytes=32\n";
 ck(cudaFree(d));ck(cudaFree(r));return 0;
 }catch(const std::exception&e){std::cerr<<e.what()<<"\n";return 1;}}
