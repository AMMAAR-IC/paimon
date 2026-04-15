#include<stdio.h>
#include<ctype.h>
int main(){
    char p[40];
    int a=0,d=0,s=0,i;
    printf("Enter Password:");
    scanf("%s",p);
    for(i=0;p[i];i++){
        if(isalpha(p[i]))a=1;
        if(isdigit(p[i]))d=1;
        if(p[i]=='&'||p[i]=='$'||p[i]=='#'||p[i]=='@')s=1;
    }
    printf(a&&d&&s&&strlen(p)>8?"Strong Password":"Weak Password");
    getch();
    return 0;
}