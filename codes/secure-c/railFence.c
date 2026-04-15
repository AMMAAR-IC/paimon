#include<stdio.h>
void main(){
    char m[20][20],p[20]="HELLOWORLD";
    int i,j,r=0,d=0,k=4;

    for(i=0;i<k;i++){
        for(j=0;j<strlen(p);j++){
            m[i][j]='*';
        }
    }

    for(i=0;i<strlen(p);i++){
        m[r][i]=p[i];
        if(r==0)d=1;
        else if(r==k-1)d=0;
        if(d)r++;else r--;
    }

    printf("Matrix:\n");
    for(i=0;i<k;i++){
        for(j=0;j<strlen(p);j++){
            printf("%c",m[i][j]);printf("\n");
        }
    }
    printf("Cipher:");

    for(i=0;i<k;i++){
        for(j=0;j<strlen(p);j++){
            if(m[i][j]!='*') printf("%c",m[i][j]);
        }
    }

    getch();
}