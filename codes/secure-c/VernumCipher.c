#include<stdio.h>
void main(){
    char p[30],c[30],k[30];
    int i;
    printf("Text:"); scanf("%s",p);
    printf("Key:"); scanf("%s",k);
    for(i=0;p[i];i++) c[i]=(p[i]-'A'^k[i]-'A')%26+'A';
    c[i]='\0'
    printf("Cipher:%s",c);
    getch();
}