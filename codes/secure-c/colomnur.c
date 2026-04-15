#include<stdio.h>
void main(){
    char key[10]="123456", 
         pl[32]="HELLOWORLD",
         m[20][20],
         c[30];
    int r,col,kl,pl_len,i,j,p=0,k;

    kl=strlen(key);
    pl_len=strlen(pl);
    col=kl;
    r=(pl_len+kl-1)/kl;

    for(i=0;i<r;i++) for(j=0;j<col;j++){
        if(p<pl_len)m[i][j]=pl[p++];
        else m[i][j]='X';
    }
    printf("Matrix:\n");

    for(i=0;i<r;i++) for(j=0;j<col;j++){
        printf("%c",m[i][j]);printf("\n");
    }
    p=0;
    for(k=1;k<=col;k++)for(j=0;j<col;j++){
        if(key[j]-'0'==k)for(i=0;i<r;i++)c[p++]=m[i][j];
    }
    c[p]='\0';
    printf("Cipher:%s",c);
    getch();
}