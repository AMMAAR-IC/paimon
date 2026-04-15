#include<stdio.h>
void main(){
    char p[30],c[30],d[30];
    int i,k;
    clrscr();
    printf("Text: ");scanf("%s",p);
    printf("Key: "); scanf("%d",&k);

    for(i=0;p[i];i++) c[i]=(p[i]-'A'+k)%26+'A';
    c[i]=d[i]='\0';
    
    for(i=0;c[i];i++)d[i]=(c[i]-'A'-k+26)%26+'A';
    printf("Cipher:%s\nPlain:%s",c,d);
    getch();
}