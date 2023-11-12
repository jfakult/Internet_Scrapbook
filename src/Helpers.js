class Helpers {
    constructor()
    {
    }

    factorial(n)
    {
        if (n == 0)
            return 1;
        else
            return n * this.factorial(n - 1);
    }
}


export default Helpers;